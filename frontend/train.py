import os
from src.dataset import DataPreprocessor, load_users, load_projects
from src.model import build_training_data, train_model, save_model

def main():
    print("=== Projexis Model Training Pipeline ===")
    
    print("1. Loading raw data...")
    users = load_users()
    projects = load_projects()
    print(f"Loaded {len(users)} users and {len(projects)} projects.")
    
    print("\n2. Fitting Preprocessor...")
    preprocessor = DataPreprocessor()
    preprocessor.fit(users, projects)
    preprocessor.save()
    print("Preprocessor saved to model/preprocessor.pkl")
    
    print("\n3. Generating synthetic training data from user-project pairing heuristics...")
    X, y = build_training_data(users, projects, preprocessor, num_samples=15000)
    print(f"Generated {len(X)} samples.")
    
    print("\n4. Training XGBoost Model...")
    model = train_model(X, y)
    
    print("\n5. Saving Model...")
    save_model(model)
    print("Model saved to model/xgboost_model.pkl")
    
    print("\n=== Training Complete! You can now run the app ===")

if __name__ == "__main__":
    os.makedirs("model", exist_ok=True)
    main()
