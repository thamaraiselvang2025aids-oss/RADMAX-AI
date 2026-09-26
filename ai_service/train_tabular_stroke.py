import os
import pandas as pd
from sklearn.model_selection import train_test_split
from sklearn.ensemble import RandomForestClassifier
from sklearn.preprocessing import LabelEncoder
from sklearn.metrics import accuracy_score, classification_report
from imblearn.over_sampling import SMOTE
import joblib

def train_stroke_model():
    data_path = os.path.join("data", "tabular_stroke", "healthcare-dataset-stroke-data.csv")
    
    print(f"Loading Stroke Prediction dataset from {data_path}...")
    df = pd.read_csv(data_path)
    
    print(f"Initial Dataset shape: {df.shape[0]} patients, {df.shape[1]} features.")
    
    # Preprocessing
    print("Preprocessing data (handling missing BMI values & categorical encoding)...")
    
    # 1. Handle missing values in BMI (replace 'N/A' or NaN with median)
    df['bmi'] = pd.to_numeric(df['bmi'], errors='coerce')
    df['bmi'] = df['bmi'].fillna(df['bmi'].median())
    
    # 2. Drop ID column (not useful for prediction)
    df = df.drop(columns=['id'])
    
    # 3. Encode Categorical Variables
    categorical_cols = ['gender', 'ever_married', 'work_type', 'Residence_type', 'smoking_status']
    le_dict = {}
    
    for col in categorical_cols:
        le = LabelEncoder()
        df[col] = le.fit_transform(df[col])
        le_dict[col] = le
    
    # Target variable is 'stroke'
    X = df.drop(columns=['stroke'])
    y = df['stroke']
    
    # The Stroke dataset is heavily imbalanced (most people do not have strokes)
    # We will use SMOTE to artificially balance the training classes so the AI learns what a stroke looks like
    print("Applying SMOTE to balance the highly imbalanced stroke dataset...")
    smote = SMOTE(random_state=42)
    X_resampled, y_resampled = smote.fit_resample(X, y)
    
    # Split the dataset into 80% training and 20% testing
    X_train, X_test, y_train, y_test = train_test_split(X_resampled, y_resampled, test_size=0.2, random_state=42, stratify=y_resampled)
    
    print("Training Random Forest Classifier on Patient Vitals...")
    clf = RandomForestClassifier(n_estimators=150, max_depth=15, random_state=42)
    clf.fit(X_train, y_train)
    
    # Predict on the test set
    print("Evaluating model...")
    y_pred = clf.predict(X_test)
    
    acc = accuracy_score(y_test, y_pred)
    
    print("\n" + "="*40)
    print(f"MODEL ACCURACY: {acc * 100:.2f}%")
    print("="*40 + "\n")
    
    print("Detailed Classification Report:")
    target_names = ["No Stroke (0)", "Stroke Risk (1)"]
    print(classification_report(y_test, y_pred, target_names=target_names))
    
    # Save the model
    os.makedirs("models", exist_ok=True)
    model_path = os.path.join("models", "tabular_stroke_rf.pkl")
    joblib.dump(clf, model_path)
    
    # Optionally save the label encoders if we want to run inference later
    encoder_path = os.path.join("models", "stroke_label_encoders.pkl")
    joblib.dump(le_dict, encoder_path)
    
    print(f"Tabular model saved successfully to {model_path}!")

if __name__ == "__main__":
    train_stroke_model()
