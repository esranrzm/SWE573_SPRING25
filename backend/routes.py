from app import app, db
from flask import request, jsonify, session
from models import User
from flask_bcrypt import Bcrypt
from flask_session import Session

bcrypt = Bcrypt(app)
server_session = Session(app)

#Get all users
@app.route("/api/users", methods=["GET"])
def get_users():
    users = User.query.all()
    result = [user.to_json() for user in users]
    return jsonify(result)


@app.route("/api/users/@me", methods=["GET"])
def get_current_user():
    user_id = session.get("user_id")

    if not user_id:
        return jsonify({
            "error": "Unauthorized"
        }), 401
    
    user = User.query.filter_by(id=user_id).first()
    return jsonify({
        "id": user.id,
        "username": user.username
    })

#register a user
@app.route("/api/users/register", methods=["POST"])
def register_user():
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

        username_exist = User.query.filter_by(username=username).first() is not None

        if username_exist:
            return jsonify({"error": f'Username {username} is already exist, select another one'}),409

        #get avatar image 
        if gender == "male":
            img_url = f"https://avatar.iran.liara.run/public/boy?username={name}"
        elif gender == "female":
            img_url = f"https://avatar.iran.liara.run/public/girl?username={name}"
        else:
            img_url = None

        hashed_password = bcrypt.generate_password_hash(password)

        new_user = User(
        name=name,
        surname=surname,
        username=username,
        email=email,
        password=hashed_password,
        occupation=occupation,
        gender=gender,
        image_url=img_url
        )

        db.session.add(new_user)
        db.session.commit()

        session["user_id"] = new_user.id

        return jsonify(
            {
                "id": new_user.id,
                "msg": "User created successfully"
            }
        ),201
     
    except Exception as e:
        db.session.rollback()
        return jsonify({"error": str(e)}), 500

@app.route("/api/users/login", methods=["POST"])
def login_user():
    username = request.json["username"]
    password = request.json["password"]

    user = User.query.filter_by(username=username).first()

    if user is None:
        return jsonify({
            "error": "Unauthorized, username is incorrect!"
        }), 401
    
    if not bcrypt.check_password_hash(user.password, password):
        return jsonify({
            "error": "Unauthorized, Password is incorrect!"
        }), 401
    
    session["user_id"] = user.id

    return jsonify(
            {
                "id": user.id,
                "username": user.username,
                "msg": "Login successfull."
            }
        ),201

@app.route("/api/users/logout", methods=["POST"])
def logout():
    session.pop("user_id")
    return "200"

#delete user
@app.route("/api/users/<string:id>", methods=["DELETE"])
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
@app.route("/api/users/<string:id>", methods=["PUT"])
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
        user.occupation = data.get("occupation", user.occupation)
        user.image_url = data.get("image_url", user.image_url)

        # Handle password change securely (hash the new password)
        new_password = data.get("password")
        if new_password:
            user.password = bcrypt.generate_password_hash(new_password)
        
        db.session.commit()
        return jsonify({"msg":"User updated successfully"}),200
    
    except Exception as e:
        db.session.rollback()
        return jsonify({"error": str(e)}), 500