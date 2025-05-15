from app import app, db
from flask import request, jsonify
from models import Edge
from flask_bcrypt import Bcrypt
from flask_session import Session
from datetime import datetime
from sqlalchemy import and_

bcrypt = Bcrypt(app)
server_session = Session(app)

# Get all edges
@app.route("/api/edges", methods=["GET"])
def get_edges():
    edges = Edge.query.all()
    result = [edge.to_json() for edge in edges]
    return jsonify(result)

# get searched edge
@app.route("/api/edges/getSearchedEdge/<string:id>", methods=["GET"])
def get_searched_edge(id):
    edge = Edge.query.filter_by(id=id).first()

    return jsonify({
        "id": edge.id,
        "userId": edge.user_id,
        "researchId": edge.research_id,
        "username": edge.username,
        "source": edge.source,
        "sourceId": edge.source_id,
        "target": edge.target,
        "targetId": edge.target_id,
        "description": edge.description,
        "createdAt": edge.created_at
    })

# get current research's edges
@app.route("/api/edges/research/<string:id>", methods=["GET"])
def get_current_research_edges(id):
    try:
        research_edges = Edge.query.filter_by(research_id=id).order_by(Edge.created_at.desc()).all()

        if not research_edges:
            return jsonify({"error": "No edge found for this research"}), 404

        edges_list = []
        for edge in research_edges:
            current_edge = {
                "id": edge.id,
                "user_id": edge.user_id,
                "research_id": edge.research_id,
                "username": edge.username,
                "source": edge.source,
                "sourceId": edge.source_id,
                "target": edge.target,
                "targetId": edge.target_id,
                "description": edge.description,
                "created_at": edge.created_at
            }
            edges_list.append(current_edge)
        
        return jsonify(edges_list), 200

    except Exception as e:
        return jsonify({"error": "An unexpected error occurred"}), 500
    
# get current research's edges filter by user
@app.route("/api/edges/research/user", methods=["GET"])
def get_current_research_edges_by_user():
    try:
        data=request.json     
        userId = data.get("userId")
        researchId = data.get("researchId")
        username = data.get("username")

        research_edges = Edge.query.filter(
            and_(
                Edge.research_id == researchId,
                Edge.username == username
            )
        ).order_by(Edge.created_at.desc()).all()

        if not research_edges:
            return jsonify({"error": "No edge found for this research created by current user"}), 404

        edges_list = []
        for edge in research_edges:
            current_edge = {
                "id": edge.id,
                "user_id": edge.user_id,
                "research_id": edge.research_id,
                "username": edge.username,
                "source": edge.source,
                "sourceId": edge.source_id,
                "target": edge.target,
                "targetId": edge.target_id,
                "description": edge.description,
                "created_at": edge.created_at
            }
            edges_list.append(current_edge)
        
        return jsonify(edges_list), 200

    except Exception as e:
        return jsonify({"error": "An unexpected error occurred"}), 500

#add a edge
@app.route("/api/edges/add", methods=["POST"])
def add_edge():
    try:
        data=request.json
            
        userId = data.get("userId")
        researchId = data.get("researchId")
        username = data.get("username")
        source = data.get("source")
        source_id = data.get("sourceId")
        target = data.get("target")
        target_id = data.get("targetId")
        description = data.get("description")

        new_edge = Edge(
            user_id=userId,
            research_id=researchId,
            username=username,
            source=source,
            source_id=source_id,
            target=target,
            target_id=target_id,
            description=description,
            created_at=datetime.now().strftime("%Y-%m-%d %H:%M:%S")
        )

        db.session.add(new_edge)
        db.session.commit()

        return jsonify(
            {
                "id": new_edge.id,
                "msg": "Edge created successfully"
            }
        ),201
     
    except Exception as e:
        db.session.rollback()
        return jsonify({"error": str(e)}), 500
    
# delete edge
@app.route("/api/edges/<string:id>", methods=["DELETE"])
def delete_edge(id):
    try:
        edge = Edge.query.get(id)
        if edge is None:
            return jsonify({"error": "Edge not found"}), 400
     
        db.session.delete(edge)
        db.session.commit()
        return jsonify({"msg":"Edge deleted successfully"}),200
    
    except Exception as e:
        db.session.rollback()
        return jsonify({"error": str(e)}), 500