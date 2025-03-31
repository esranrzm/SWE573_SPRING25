from app import app, db
from flask import request, jsonify, session
from models import Research, User
from flask_bcrypt import Bcrypt
from flask_session import Session
from datetime import datetime

bcrypt = Bcrypt(app)
server_session = Session(app)

# Get all research
@app.route("/api/researches", methods=["GET"])
def get_researches():
    researches = Research.query.order_by(Research.created_at.desc()).all()
    result = [research.to_json() for research in researches]
    return jsonify(result)

# get current research
@app.route("/api/researches/<string:id>", methods=["GET"])
def get_current_research(id):
    
    research = Research.query.filter_by(id=id).first()

    return jsonify({
        "id": research.id,
        "authorId": research.author_id,
        "authorName": research.author_name,
        "title": research.title,
        "description": research.description,
        "tags": research.tags,
        "createdAt": research.created_at
    }), 200


# get current research
@app.route("/api/researches/user/<string:id>", methods=["GET"])
def get_current_user_research(id):
    
    user_researches = Research.query.filter_by(author_id=id).order_by(Research.created_at.desc()).all()

    if not user_researches:
        return jsonify({"error": "No research found for this author"}), 404

    result = [research.to_json() for research in user_researches]
    return jsonify(result)


# create a research
@app.route("/api/researches/create", methods=["POST"])
def create_research():
    try:
        author_id=session.get("user_id")
        print(author_id)
        if author_id:
            user = User.query.filter_by(id=author_id).first()
            if user:
                username=user.username
            else:
                return jsonify({"error": "No user found. Check the DB."}), 404
        else:
            return jsonify({"error": "No logged in user found. Unauthorized..."}), 401

        data=request.json
        authorName = username
        title = data.get("title")
        description = data.get("description")
        tags = data.get("tags")
        createdAt = datetime.now().strftime("%Y-%m-%d %H:%M:%S")


        new_research = Research(
                            author_id=session.get("user_id"),
                            author_name=authorName,
                            title=title,
                            description=description,
                            tags=tags,
                            created_at=createdAt
                        )

        db.session.add(new_research)
        db.session.commit()

        return jsonify(
            {
                "id": new_research.id,
                "msg": "Research created successfully"
            }
        ),200
     
    except Exception as e:
        db.session.rollback()
        return jsonify({"error": str(e)}), 500


# delete research
@app.route("/api/researches/<string:id>", methods=["DELETE"])
def delete_research(id):
    try:
        research = Research.query.get(id)
        if research is None:
            return jsonify({"error": "Research not found"}), 400
        
        db.session.delete(research)
        db.session.commit()
        return jsonify({"msg":"Research deleted successfully"}),200
    
    except Exception as e:
        db.session.rollback()
        return jsonify({"error": str(e)}), 500


# update research
@app.route("/api/researches/<string:id>", methods=["PUT"])
def update_research(id):
    try:
        research = Research.query.get(id)
        if research is None:
            return jsonify({"error": "Research not found"}), 404
        
        data = request.json
        research.title = data.get("title", research.title)
        research.description = data.get("description", research.description)
        research.tags =  data.get("tags", research.tags)

        
        db.session.commit()
        return jsonify({"msg":"Research updated successfully"}),200
        
    
    except Exception as e:
        db.session.rollback()
        return jsonify({"error": str(e)}), 500