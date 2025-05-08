from app import app, db
from flask import request, jsonify
from models import Node, Edge
from flask_bcrypt import Bcrypt
from flask_session import Session
from datetime import datetime
import requests
from sqlalchemy import and_

bcrypt = Bcrypt(app)
server_session = Session(app)

# Get all nodes
@app.route("/api/nodes", methods=["GET"])
def get_nodes():
    nodes = Node.query.all()
    result = [node.to_json() for node in nodes]
    return jsonify(result)

# get searched node
@app.route("/api/nodes/getSearchedNode/<string:id>", methods=["GET"])
def get_searched_node(id):
    node = Node.query.filter_by(id=id).first()

    return jsonify({
        "id": node.id,
        "userId": node.user_id,
        "researchId": node.research_id,
        "username": node.username,
        "label": node.label,
        "createdAt": node.created_at
    })

# get current research's nodes
@app.route("/api/nodes/research/<string:id>", methods=["GET"])
def get_current_research_nodes(id):
    try:
        research_nodes = Node.query.filter_by(research_id=id).order_by(Node.created_at.desc()).all()

        if not research_nodes:
            return jsonify({"error": "No nodes found for this research"}), 404

        nodes_list = []
        for node in research_nodes:
            current_node = {
                "id": node.id,
                "user_id": node.user_id,
                "research_id": node.research_id,
                "username": node.username,
                "label": node.label,
                "created_at": node.created_at
            }
            nodes_list.append(current_node)
        
        return jsonify(nodes_list), 200

    except Exception as e:
        return jsonify({"error": "An unexpected error occurred"}), 500
    
# get current research's nodes filter by user
@app.route("/api/nodes/research/user", methods=["GET"])
def get_current_research_nodes_by_user():
    try:
        data=request.json     
        userId = data.get("userId")
        researchId = data.get("researchId")
        username = data.get("username")

        research_nodes = Node.query.filter(
            and_(
                Node.research_id == researchId,
                Node.username == username
            )
        ).order_by(Node.created_at.desc()).all()

        if not research_nodes:
            return jsonify({"error": "No nodes found for this research created by current user"}), 404

        nodes_list = []
        for node in research_nodes:
            current_node = {
                "id": node.id,
                "user_id": node.user_id,
                "research_id": node.research_id,
                "username": node.username,
                "label": node.label,
                "created_at": node.created_at
            }
            nodes_list.append(current_node)
        
        return jsonify(nodes_list), 200

    except Exception as e:
        return jsonify({"error": "An unexpected error occurred"}), 500

#add a node
@app.route("/api/nodes/add", methods=["POST"])
def add_node():
    try:
        data=request.json
            
        userId = data.get("userId")
        researchId = data.get("researchId")
        username = data.get("username")
        label = data.get("label")

        new_node = Node(
            user_id=userId,
            research_id=researchId,
            username=username,
            label=label,
            created_at=datetime.now().strftime("%Y-%m-%d %H:%M:%S")
        )

        db.session.add(new_node)
        db.session.commit()

        return jsonify(
            {
                "id": new_node.id,
                "msg": "Node created successfully"
            }
        ),201
     
    except Exception as e:
        db.session.rollback()
        return jsonify({"error": str(e)}), 500
    
# delete node
@app.route("/api/nodes/<string:id>", methods=["DELETE"])
def delete_node(id):
    try:
        node = Node.query.get(id)
        if node is None:
            return jsonify({"error": "Node not found"}), 400
        
        node_source_connections = Edge.query.filter_by(source_id=id).order_by(Edge.created_at.desc()).all()
        node_target_connections = Edge.query.filter_by(target_id=id).order_by(Edge.created_at.desc()).all()

        if node_source_connections:
            try:
                for source_edge in node_source_connections:
                    db.session.delete(source_edge)
            except requests.exceptions.RequestException as e:
                app.logger.error(f"Failed to delete edges for source node {id}: {e}")

        if node_target_connections:
            try:
                for target_edge in node_target_connections:
                    db.session.delete(target_edge)
            except requests.exceptions.RequestException as e:
                app.logger.error(f"Failed to delete edges for target node {id}: {e}")
        
        db.session.delete(node)
        db.session.commit()
        return jsonify({"msg":"Node deleted successfully"}),200
    
    except Exception as e:
        db.session.rollback()
        return jsonify({"error": str(e)}), 500