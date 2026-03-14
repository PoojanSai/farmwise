from rest_framework import viewsets, status
from rest_framework.decorators import action
from rest_framework.permissions import IsAuthenticated, AllowAny
from rest_framework.response import Response
from django.db import transaction
from .models import Category, Product, Order, OrderItem
from .serializers import (
    CategorySerializer, ProductSerializer,
    OrderSerializer, OrderCreateSerializer, OrderItemSerializer
)


class CategoryViewSet(viewsets.ReadOnlyModelViewSet):
    queryset = Category.objects.all()
    serializer_class = CategorySerializer
    permission_classes = [AllowAny]


class ProductViewSet(viewsets.ReadOnlyModelViewSet):
    queryset = Product.objects.filter(is_active=True).select_related('category')
    serializer_class = ProductSerializer
    permission_classes = [AllowAny]

    def get_queryset(self):
        qs = super().get_queryset()
        category = self.request.query_params.get('category')
        search = self.request.query_params.get('search')
        if category:
            qs = qs.filter(category__id=category)
        if search:
            qs = qs.filter(name__icontains=search)
        return qs


class OrderViewSet(viewsets.ModelViewSet):
    serializer_class = OrderSerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        return Order.objects.filter(farmer=self.request.user).prefetch_related('items__product')

    def create(self, request, *args, **kwargs):
        serializer = OrderCreateSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        data = serializer.validated_data

        try:
            with transaction.atomic():
                total = 0
                order_items = []
                for item_data in data['items']:
                    product = Product.objects.get(id=item_data['product_id'])
                    qty = int(item_data['quantity'])
                    unit_price = float(product.discounted_price)
                    item_total = unit_price * qty
                    total += item_total
                    order_items.append((product, qty, unit_price, item_total))

                order = Order.objects.create(
                    farmer=request.user,
                    total_amount=total,
                    delivery_address=data['delivery_address'],
                    notes=data.get('notes', ''),
                    status='confirmed'
                )
                for product, qty, unit_price, item_total in order_items:
                    OrderItem.objects.create(
                        order=order, product=product,
                        quantity=qty, unit_price=unit_price, total_price=item_total
                    )

                return Response(
                    {'message': 'Order placed successfully!', 'order': OrderSerializer(order).data},
                    status=status.HTTP_201_CREATED
                )
        except Product.DoesNotExist:
            return Response({'error': 'One or more products not found.'}, status=400)
        except Exception as e:
            return Response({'error': str(e)}, status=400)
