from app import app, db
from flask import request, jsonify
from models import User

#Get all users
@app.route("/api/users", methods=["GET"])
def get_users():
    users = User.query.all()
    result = [user.to_json() for user in users]
    return jsonify(result)

#create user
@app.route("/api/users", methods=["POST"])
def create_user():
    try:
        data=request.json

        required_fields = ["name", "surname", "username", "email", "password", "occupation", "gender"]
        for field in required_fields:
            if field not in data:
                return jsonify({"error": f'Missing required field: {field}'}),400

        name = data.get("name")
        surname = data.get("surname")
        username = data.get("username")
        email = data.get("email")
        password = data.get("password")
        occupation = data.get("occupation")
        gender = data.get("gender")

        #get avatar image 
        if gender == "male":
            img_url = f"https://avatar.iran.liara.run/public/boy?username={name}"
        elif gender == "female":
            img_url = f"https://avatar.iran.liara.run/public/girl?username={name}"
        else:
            img_url = None

        new_user = User(
            name=name,
            surname=surname,
            username=username,
            email=email,
            password=password,
            occupation=occupation,
            gender=gender,
            image_url=img_url
        )

        db.session.add(new_user)
        db.session.commit()

        return jsonify({"msg": "User created successfully"}),201
    
    except Exception as e:
        db.session.rollback()
        return jsonify({"error": str(e)}), 500


#delete user
@app.route("/api/users/<int:id>", methods=["DELETE"])
def delete_user(id):
    try:
        user = User.query.get(id)
        if user is None:
            return jsonify({"error": "User not found"}), 400
        
        db.session.delete(user)
        db.session.commit()
        return jsonify({"msg":"User deleted successfully"}),200
    
    except Exception as e:
        db.session.rollback()
        return jsonify({"error": str(e)}), 500


#delete user
@app.route("/api/users/<int:id>", methods=["PUT"])
def update_user(id):
    try:
        user = User.query.get(id)
        if user is None:
            return jsonify({"error": "User not found"}), 404
        
        data = request.json

        user.name = data.get("name", user.name)
        user.surname = data.get("surname", user.surname)
        user.username = data.get("username", user.username)
        user.email = data.get("email", user.email)
        user.password = data.get("password", user.password)
        user.occupation = data.get("occupation", user.occupation)
        user.image_url = data.get("image_url", user.image_url)
        
        db.session.commit()
        return jsonify({"msg":"User updated successfully"}),200
    
    except Exception as e:
        db.session.rollback()
        return jsonify({"error": str(e)}), 500