import os
import pandas as pd
from sklearn.model_selection import train_test_split
from sklearn.ensemble import RandomForestClassifier
from sklearn.metrics import accuracy_score, classification_report
import joblib

def train_tabular():
    data_path = os.path.join("data", "Brain Tumor.csv")
    
    print(f"Loading tabular dataset from {data_path}...")
    df = pd.read_csv(data_path)
    
    # The first column is 'Image' (string like Image1, Image2), we don't need it for training
    # The 'Class' column is our target variable (0 or 1)
    
    X = df.drop(columns=['Image', 'Class'])
    y = df['Class']
    
    print(f"Dataset shape: {X.shape[0]} samples, {X.shape[1]} statistical features.")
    
    # Split the dataset into 80% training and 20% testing
    X_train, X_test, y_train, y_test = train_test_split(X, y, test_size=0.2, random_state=42, stratify=y)
    
    print("Training Random Forest Classifier on statistical features...")
    # Initialize the model
    clf = RandomForestClassifier(n_estimators=100, random_state=42)
    
    # Train the model
    clf.fit(X_train, y_train)
    
    # Predict on the test set
    print("Evaluating model...")
    y_pred = clf.predict(X_test)
    
    # Calculate accuracy
    acc = accuracy_score(y_test, y_pred)
    
    print("\n" + "="*40)
    print(f"MODEL ACCURACY: {acc * 100:.2f}%")
    print("="*40 + "\n")
    
    print("Detailed Classification Report:")
    print(classification_report(y_test, y_pred, target_names=["No Tumor (0)", "Tumor (1)"]))
    
    # Save the model
    os.makedirs("models", exist_ok=True)
    model_path = os.path.join("models", "tabular_brain_tumor_rf.pkl")
    joblib.dump(clf, model_path)
    print(f"Tabular model saved successfully to {model_path}!")

if __name__ == "__main__":
    train_tabular()
