import os
import pandas as pd
from sklearn.model_selection import train_test_split
from sklearn.ensemble import RandomForestClassifier
from sklearn.metrics import accuracy_score, classification_report
import joblib

def train_pregnancy_model():
    data_path = os.path.join("data", "tabular_pregnancy", "fetal_health.csv")
    
    print(f"Loading Fetal Health dataset from {data_path}...")
    df = pd.read_csv(data_path)
    
    # Target variable is 'fetal_health': 1 (Normal), 2 (Suspect), 3 (Pathological)
    X = df.drop(columns=['fetal_health'])
    y = df['fetal_health']
    
    print(f"Dataset shape: {X.shape[0]} patient records, {X.shape[1]} CTG vitals features.")
    
    # Split the dataset into 80% training and 20% testing
    X_train, X_test, y_train, y_test = train_test_split(X, y, test_size=0.2, random_state=42, stratify=y)
    
    print("Training Random Forest Classifier on CTG data...")
    clf = RandomForestClassifier(n_estimators=100, random_state=42, class_weight='balanced')
    clf.fit(X_train, y_train)
    
    # Predict on the test set
    print("Evaluating model...")
    y_pred = clf.predict(X_test)
    
    acc = accuracy_score(y_test, y_pred)
    
    print("\n" + "="*40)
    print(f"MODEL ACCURACY: {acc * 100:.2f}%")
    print("="*40 + "\n")
    
    print("Detailed Classification Report:")
    target_names = ["Normal (1.0)", "Suspect (2.0)", "Pathological (3.0)"]
    print(classification_report(y_test, y_pred, target_names=target_names))
    
    # Save the model
    os.makedirs("models", exist_ok=True)
    model_path = os.path.join("models", "tabular_fetal_health_rf.pkl")
    joblib.dump(clf, model_path)
    print(f"Tabular model saved successfully to {model_path}!")

if __name__ == "__main__":
    train_pregnancy_model()
