"""
AI Crop Recommendation Engine using Random Forest (scikit-learn).
Uses a pre-trained model or trains on the fly with embedded dataset.
"""
import numpy as np
import os
import pickle
from pathlib import Path

# Crop dataset: [N, P, K, temp, humidity, pH, rainfall] → crop label
CROP_DATA = [
    # rice
    [90, 42, 43, 21, 82, 6.5, 202],
    [85, 58, 41, 23, 80, 7.0, 226],
    [60, 55, 44, 24, 82, 6.8, 240],
    # maize
    [78, 48, 20, 22, 65, 6.2, 85],
    [82, 45, 22, 25, 60, 6.5, 90],
    [85, 50, 25, 24, 62, 6.0, 80],
    # chickpea
    [40, 67, 20, 18, 16, 7.3, 80],
    [43, 70, 19, 22, 18, 7.5, 74],
    [38, 65, 21, 20, 15, 7.0, 84],
    # kidneybeans
    [20, 67, 20, 20, 20, 5.8, 105],
    [22, 69, 18, 22, 22, 6.0, 110],
    # pigeonpeas
    [20, 67, 20, 27, 48, 5.8, 149],
    [18, 65, 22, 28, 50, 6.0, 155],
    # mothbeans
    [20, 40, 20, 28, 26, 6.9, 50],
    [22, 42, 18, 30, 28, 7.0, 55],
    # mungbean
    [20, 47, 20, 29, 85, 6.8, 48],
    [18, 45, 22, 28, 80, 7.0, 55],
    # blackgram
    [40, 67, 19, 30, 65, 7.2, 67],
    [38, 65, 21, 28, 60, 7.0, 72],
    # lentil
    [18, 68, 19, 25, 64, 7.0, 46],
    [20, 70, 18, 23, 62, 7.2, 42],
    # pomegranate
    [18, 18, 40, 22, 90, 6.0, 107],
    [20, 20, 38, 24, 88, 6.2, 115],
    # banana
    [100,82, 50, 27, 80, 5.9, 105],
    [98, 80, 52, 28, 78, 6.0, 115],
    # mango
    [20, 27, 30, 31, 50, 5.8, 90],
    [22, 25, 32, 30, 52, 6.0, 95],
    # grapes
    [23, 132, 200, 24, 81, 6.0, 69],
    [25, 128, 195, 22, 80, 6.2, 75],
    # watermelon
    [99, 17, 50, 27, 90, 6.5, 50],
    [95, 15, 48, 28, 88, 6.8, 55],
    # muskmelon
    [100,17, 50, 28, 92, 6.4, 25],
    [98, 18, 52, 30, 90, 6.2, 28],
    # apple
    [20, 134, 200, 21, 92, 5.8, 112],
    [22, 132, 198, 20, 90, 6.0, 108],
    # orange
    [20, 16, 10, 22, 92, 7.0, 110],
    [22, 18, 12, 24, 90, 7.2, 105],
    # papaya
    [49, 59, 45, 34, 92, 6.7, 143],
    [50, 60, 47, 33, 90, 6.5, 150],
    # coconut
    [22, 14, 30, 27, 94, 5.9, 175],
    [20, 16, 32, 28, 92, 6.0, 180],
    # cotton
    [117,46, 19, 24, 80, 6.8, 80],
    [115,44, 21, 25, 78, 7.0, 85],
    # jute
    [78, 46, 39, 30, 80, 6.7, 174],
    [80, 48, 38, 31, 78, 6.5, 178],
    # coffee
    [101,28, 30, 26, 58, 6.3, 158],
    [98, 30, 32, 25, 60, 6.5, 162],
    # wheat
    [30, 55, 48, 20, 70, 6.5, 75],
    [32, 52, 50, 18, 72, 6.8, 80],
    # sugarcane
    [20, 15, 18, 28, 65, 6.5, 95],
    [22, 18, 20, 30, 68, 7.0, 105],
]

CROP_LABELS = [
    'rice','rice','rice',
    'maize','maize','maize',
    'chickpea','chickpea','chickpea',
    'kidneybeans','kidneybeans',
    'pigeonpeas','pigeonpeas',
    'mothbeans','mothbeans',
    'mungbean','mungbean',
    'blackgram','blackgram',
    'lentil','lentil',
    'pomegranate','pomegranate',
    'banana','banana',
    'mango','mango',
    'grapes','grapes',
    'watermelon','watermelon',
    'muskmelon','muskmelon',
    'apple','apple',
    'orange','orange',
    'papaya','papaya',
    'coconut','coconut',
    'cotton','cotton',
    'jute','jute',
    'coffee','coffee',
    'wheat','wheat',
    'sugarcane','sugarcane',
]

YIELD_MAP = {
    'rice': '3.5–5.0 tonnes/acre',
    'maize': '2.5–4.0 tonnes/acre',
    'chickpea': '0.8–1.5 tonnes/acre',
    'kidneybeans': '1.0–1.8 tonnes/acre',
    'pigeonpeas': '1.0–2.0 tonnes/acre',
    'mothbeans': '0.5–1.0 tonnes/acre',
    'mungbean': '0.6–1.2 tonnes/acre',
    'blackgram': '0.6–1.2 tonnes/acre',
    'lentil': '0.8–1.5 tonnes/acre',
    'pomegranate': '5.0–8.0 tonnes/acre',
    'banana': '10.0–15.0 tonnes/acre',
    'mango': '4.0–7.0 tonnes/acre',
    'grapes': '6.0–10.0 tonnes/acre',
    'watermelon': '8.0–12.0 tonnes/acre',
    'muskmelon': '6.0–9.0 tonnes/acre',
    'apple': '5.0–8.0 tonnes/acre',
    'orange': '4.0–7.0 tonnes/acre',
    'papaya': '8.0–14.0 tonnes/acre',
    'coconut': '4000–8000 nuts/acre',
    'cotton': '0.5–1.2 tonnes/acre (lint)',
    'jute': '1.5–2.5 tonnes/acre',
    'coffee': '0.5–1.0 tonnes/acre',
    'wheat': '2.0–3.5 tonnes/acre',
    'sugarcane': '30–50 tonnes/acre',
}

MODEL_PATH = Path(__file__).parent / 'crop_model.pkl'


def get_model():
    """Load or train the Random Forest model."""
    if MODEL_PATH.exists():
        with open(MODEL_PATH, 'rb') as f:
            return pickle.load(f)
    return _train_model()


def _train_model():
    from sklearn.ensemble import RandomForestClassifier
    from sklearn.preprocessing import LabelEncoder

    X = np.array(CROP_DATA)
    y = np.array(CROP_LABELS)

    clf = RandomForestClassifier(n_estimators=100, random_state=42)
    clf.fit(X, y)

    with open(MODEL_PATH, 'wb') as f:
        pickle.dump(clf, f)

    return clf


def predict_crop(n, p, k, temperature, humidity, ph, rainfall):
    """Run ML prediction and return top crops with probabilities."""
    model = get_model()
    features = np.array([[n, p, k, temperature, humidity, ph, rainfall]])

    proba = model.predict_proba(features)[0]
    classes = model.classes_

    # Sort by probability
    sorted_indices = np.argsort(proba)[::-1]
    top_crops = [
        {'crop': classes[i], 'score': round(float(proba[i]), 4)}
        for i in sorted_indices[:5] if proba[i] > 0
    ]

    best_crop = top_crops[0]['crop']
    confidence = top_crops[0]['score']
    yield_est = YIELD_MAP.get(best_crop, '–')

    return {
        'recommended_crop': best_crop,
        'confidence_score': confidence,
        'top_crops': top_crops,
        'yield_estimate': yield_est,
    }
