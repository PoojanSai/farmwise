from rest_framework import serializers
from rest_framework_simplejwt.serializers import TokenObtainPairSerializer
from .models import Farmer, LandDetail


class LandDetailSerializer(serializers.ModelSerializer):
    class Meta:
        model = LandDetail
        fields = '__all__'
        read_only_fields = ['farmer']


class FarmerSerializer(serializers.ModelSerializer):
    lands = LandDetailSerializer(many=True, read_only=True)

    class Meta:
        model = Farmer
        fields = [
            'id', 'email', 'full_name', 'phone', 'village', 'district', 'state',
            'land_size_acres', 'soil_type', 'crops_grown', 'crops_list',
            'profile_image', 'date_joined', 'lands'
        ]
        read_only_fields = ['id', 'date_joined', 'crops_list']

    def to_representation(self, instance):
        data = super().to_representation(instance)
        if instance.profile_image:
            request = self.context.get('request')
            if request:
                data['profile_image'] = request.build_absolute_uri(instance.profile_image.url)
        return data


class FarmerRegisterSerializer(serializers.ModelSerializer):
    password = serializers.CharField(write_only=True, min_length=6)
    confirm_password = serializers.CharField(write_only=True)

    class Meta:
        model = Farmer
        fields = [
            'email', 'password', 'confirm_password', 'full_name', 'phone',
            'village', 'district', 'state', 'land_size_acres', 'soil_type', 'crops_grown'
        ]

    def validate(self, data):
        if data['password'] != data['confirm_password']:
            raise serializers.ValidationError({'confirm_password': 'Passwords do not match.'})
        return data

    def create(self, validated_data):
        validated_data.pop('confirm_password')
        password = validated_data.pop('password')
        farmer = Farmer(**validated_data)
        farmer.set_password(password)
        farmer.save()
        return farmer


class FarmerTokenSerializer(TokenObtainPairSerializer):
    @classmethod
    def get_token(cls, user):
        token = super().get_token(user)
        token['email'] = user.email
        token['full_name'] = user.full_name
        return token
