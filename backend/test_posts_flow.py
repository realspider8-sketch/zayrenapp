import asyncio
import os
import sys
from uuid import uuid4

# Set up paths
sys.path.insert(0, os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from fastapi.testclient import TestClient
from backend.main import app
from backend.database import init_db, engine, Base, SQLITE_DB_URL, AsyncSessionLocal
from backend.models import User, Post, PostLike, PostComment, PostShare
from backend.services import UserService
from backend.schemas import UserCreate

client = TestClient(app)

async def test_flow():
    print("--- 0. Initializing DB ---")
    # Ensure SQLite DB is used and initialized
    init_db(SQLITE_DB_URL)
    async with engine.begin() as conn:
        await conn.run_sync(Base.metadata.create_all)

    async with AsyncSessionLocal() as session:
        print("--- 1. Create User A ---")
        user_a_email = f"user_a_{uuid4().hex[:6]}@test.com"
        user_a_id = str(uuid4())
        user_a = await UserService.create_user(session, UserCreate(
            id=user_a_id,
            email=user_a_email,
            password="Password123",
            name="User A",
            username=f"usera_{uuid4().hex[:6]}"
        ))
        
        print("--- 2. Create User B ---")
        user_b_email = f"user_b_{uuid4().hex[:6]}@test.com"
        user_b_id = str(uuid4())
        user_b = await UserService.create_user(session, UserCreate(
            id=user_b_id,
            email=user_b_email,
            password="Password123",
            name="User B",
            username=f"userb_{uuid4().hex[:6]}"
        ))
        
        user_a_id = str(user_a.id)
        user_b_id = str(user_b.id)
        
        # MOCK AUTHENTICATION token is just the user UUID for local testing
        auth_a = {"Authorization": f"Bearer {user_a_id}"}
        auth_b = {"Authorization": f"Bearer {user_b_id}"}
        
        print("--- 3. User A creates a post ---")
        res = client.post("/api/posts", json={"content": "Hello ZAYREN!"}, headers=auth_a)
        assert res.status_code == 200, res.text
        post = res.json()
        post_id = post["id"]
        print(f"Created post: {post_id}")
        
        print("--- 4. User B logs in (mock token) ---")
        # In our mock auth, providing the user ID as bearer token logs them in locally
        
        print("--- 5. User B sees User A's post ---")
        res = client.get("/api/posts", headers=auth_b)
        assert res.status_code == 200
        feed = res.json()
        assert any(p["id"] == post_id for p in feed)
        print("User B fetched feed successfully.")
        
        print("--- 6. User B likes the post ---")
        res = client.post(f"/api/posts/{post_id}/like", headers=auth_b)
        assert res.status_code == 200
        
        # Check like count
        res = client.get("/api/posts", headers=auth_b)
        feed = res.json()
        liked_post = next(p for p in feed if p["id"] == post_id)
        assert liked_post["likes_count"] == 1
        assert liked_post["is_liked_by_me"] == True
        print("Like successful and verified.")
        
        print("--- 7. User B unlikes the post ---")
        res = client.delete(f"/api/posts/{post_id}/like", headers=auth_b)
        assert res.status_code == 200
        
        # Check like count
        res = client.get("/api/posts", headers=auth_b)
        feed = res.json()
        unliked_post = next(p for p in feed if p["id"] == post_id)
        assert unliked_post["likes_count"] == 0
        assert unliked_post["is_liked_by_me"] == False
        print("Unlike successful and verified.")
        
        print("--- 8. User B likes it again ---")
        res = client.post(f"/api/posts/{post_id}/like", headers=auth_b)
        assert res.status_code == 200
        
        print("--- 9. User B comments ---")
        res = client.post(f"/api/posts/{post_id}/comments", json={"content": "Nice post!"}, headers=auth_b)
        assert res.status_code == 200
        comment = res.json()
        comment_id = comment["id"]
        print(f"Created comment: {comment_id}")
        
        print("--- 10. User B deletes their comment ---")
        res = client.delete(f"/api/posts/comments/{comment_id}", headers=auth_b)
        assert res.status_code == 200
        print("Comment deleted successfully.")
        
        print("--- 11. User B shares/reposts the post ---")
        res = client.post(f"/api/posts/{post_id}/share", headers=auth_b)
        assert res.status_code == 200
        print("Post shared successfully.")
        
        print("--- 12. Restart application (simulated by querying DB directly) ---")
        print("--- 13. Confirm all data is correctly stored in the database ---")
        from sqlalchemy import select
        # Check post
        db_post = await session.scalar(select(Post).where(Post.id == post_id))
        assert db_post is not None
        # Check like
        db_like = await session.scalar(select(PostLike).where(PostLike.post_id == post_id))
        assert db_like is not None
        # Check share
        db_share = await session.scalar(select(PostShare).where(PostShare.post_id == post_id))
        assert db_share is not None
        # Check comment deleted
        db_comment = await session.scalar(select(PostComment).where(PostComment.post_id == post_id))
        assert db_comment is None
        
        print("ALL TESTS PASSED SUCCESSFULLY! Data is persisted correctly.")

if __name__ == "__main__":
    asyncio.run(test_flow())
