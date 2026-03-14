from rest_framework import viewsets, status
from rest_framework.decorators import api_view, permission_classes, action
from rest_framework.permissions import IsAuthenticated, AllowAny
from rest_framework.response import Response
from .models import CropRecommendation, CropListing, BuyerInterest
from .serializers import (
    CropRecommendationSerializer, CropRecommendRequestSerializer,
    CropListingSerializer, BuyerInterestSerializer
)
from .ml_engine import predict_crop


@api_view(['POST'])
@permission_classes([IsAuthenticated])
def recommend_crop(request):
    """
    POST /api/crops/recommend-crop/
    Takes soil + weather params and returns crop recommendation via ML model.
    """
    serializer = CropRecommendRequestSerializer(data=request.data)
    serializer.is_valid(raise_exception=True)
    data = serializer.validated_data

    try:
        result = predict_crop(
            n=data['nitrogen'], p=data['phosphorus'], k=data['potassium'],
            temperature=data['temperature'], humidity=data['humidity'],
            ph=data['ph'], rainfall=data['rainfall']
        )
    except Exception as e:
        return Response({'error': f'ML prediction failed: {str(e)}'}, status=500)

    # Save recommendation to DB
    rec = CropRecommendation.objects.create(
        farmer=request.user,
        nitrogen=data['nitrogen'],
        phosphorus=data['phosphorus'],
        potassium=data['potassium'],
        temperature=data['temperature'],
        humidity=data['humidity'],
        ph=data['ph'],
        rainfall=data['rainfall'],
        recommended_crop=result['recommended_crop'],
        confidence_score=result['confidence_score'],
        top_crops=result['top_crops'],
        yield_estimate=result['yield_estimate'],
    )

    return Response({
        'success': True,
        'recommendation': CropRecommendationSerializer(rec).data
    })


class CropRecommendationViewSet(viewsets.ReadOnlyModelViewSet):
    serializer_class = CropRecommendationSerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        return CropRecommendation.objects.filter(farmer=self.request.user)


class CropListingViewSet(viewsets.ModelViewSet):
    serializer_class = CropListingSerializer

    def get_permissions(self):
        if self.action in ['list', 'retrieve']:
            return [AllowAny()]
        return [IsAuthenticated()]

    def get_queryset(self):
        qs = CropListing.objects.all()
        crop = self.request.query_params.get('crop')
        if crop:
            qs = qs.filter(crop_name__icontains=crop)
        return qs

    def perform_create(self, serializer):
        serializer.save(farmer=self.request.user)

    @action(detail=False, methods=['get'], permission_classes=[IsAuthenticated])
    def my_listings(self, request):
        listings = CropListing.objects.filter(farmer=request.user)
        return Response(CropListingSerializer(listings, many=True).data)


class BuyerInterestViewSet(viewsets.ModelViewSet):
    serializer_class = BuyerInterestSerializer
    permission_classes = [AllowAny]
    queryset = BuyerInterest.objects.all()
