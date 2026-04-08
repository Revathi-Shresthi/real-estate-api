import pandas as pd
import numpy as np
from sklearn.model_selection import train_test_split
from sklearn.linear_model import LinearRegression
from sklearn.preprocessing import LabelEncoder
from sklearn.metrics import mean_absolute_error, r2_score
import joblib
import os

print("Loading data...")
df = pd.read_csv('data/properties.csv')

print(f"Dataset shape: {df.shape}")
print(df.head())

le_city = LabelEncoder()
le_state = LabelEncoder()
le_type = LabelEncoder()
le_category = LabelEncoder()

df['city_encoded'] = le_city.fit_transform(df['city'])
df['state_encoded'] = le_state.fit_transform(df['state'])
df['type_encoded'] = le_type.fit_transform(df['type'])
df['category_encoded'] = le_category.fit_transform(df['category'])

features = [
    'city_encoded',
    'state_encoded',
    'type_encoded',
    'category_encoded',
    'bedrooms',
    'bathrooms',
    'area'
]

X = df[features]
y = df['price']

X_train, X_test, y_train, y_test = train_test_split(
    X, y, test_size=0.2, random_state=42
)

print("Training model...")
model = LinearRegression()
model.fit(X_train, y_train)

y_pred = model.predict(X_test)
mae = mean_absolute_error(y_test, y_pred)
r2 = r2_score(y_test, y_pred)

print(f"Mean Absolute Error: {mae:,.0f}")
print(f"R2 Score: {r2:.4f}")

os.makedirs('model', exist_ok=True)

joblib.dump(model, 'model/model.pkl')
joblib.dump(le_city, 'model/le_city.pkl')
joblib.dump(le_state, 'model/le_state.pkl')
joblib.dump(le_type, 'model/le_type.pkl')
joblib.dump(le_category, 'model/le_category.pkl')

print("Model saved successfully!")
print("Files saved in model/ folder")