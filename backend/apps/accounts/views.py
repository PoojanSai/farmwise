from rest_framework import generics, status, viewsets
from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import IsAuthenticated, AllowAny
from rest_framework.response import Response
from rest_framework_simplejwt.views import TokenObtainPairView
from .models import Farmer, LandDetail
from .serializers import (
    FarmerRegisterSerializer, FarmerSerializer,
    FarmerTokenSerializer, LandDetailSerializer
)


class FarmerRegisterView(generics.CreateAPIView):
    queryset = Farmer.objects.all()
    serializer_class = FarmerRegisterSerializer
    permission_classes = [AllowAny]

    def create(self, request, *args, **kwargs):
        serializer = self.get_serializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        farmer = serializer.save()
        return Response({
            'message': 'Registration successful! Welcome to FarmWise.',
            'farmer': FarmerSerializer(farmer, context={'request': request}).data
        }, status=status.HTTP_201_CREATED)


class FarmerLoginView(TokenObtainPairView):
    serializer_class = FarmerTokenSerializer
    permission_classes = [AllowAny]

    def post(self, request, *args, **kwargs):
        response = super().post(request, *args, **kwargs)
        if response.status_code == 200:
            email = request.data.get('email')
            try:
                farmer = Farmer.objects.get(email=email)
                response.data['farmer'] = FarmerSerializer(
                    farmer, context={'request': request}
                ).data
            except Farmer.DoesNotExist:
                pass
        return response


@api_view(['GET', 'PUT'])
@permission_classes([IsAuthenticated])
def farmer_profile(request):
    farmer = request.user
    if request.method == 'GET':
        serializer = FarmerSerializer(farmer, context={'request': request})
        return Response(serializer.data)
    else:
        serializer = FarmerSerializer(farmer, data=request.data, partial=True, context={'request': request})
        serializer.is_valid(raise_exception=True)
        serializer.save()
        return Response(serializer.data)


class LandDetailViewSet(viewsets.ModelViewSet):
    serializer_class = LandDetailSerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        return LandDetail.objects.filter(farmer=self.request.user)

    def perform_create(self, serializer):
        serializer.save(farmer=self.request.user)
