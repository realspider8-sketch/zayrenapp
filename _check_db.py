import sqlite3
conn = sqlite3.connect('zayren_db.db')
c = conn.cursor()
c.execute("SELECT name FROM sqlite_master WHERE type='table'")
print('TABLES:', [r[0] for r in c.fetchall()])
for t in ['products','shops','delivery_offices','cart_items','orders','payments','purchase_receipts','users']:
    try:
        c.execute(f"SELECT count(*) FROM {t}")
        print(f'{t}: {c.fetchone()[0]}')
    except Exception as e:
        print(f'{t}: ERROR - {e}')
# Check columns
c.execute("PRAGMA table_info(products)")
print('products columns:', [r[1] for r in c.fetchall()])
c.execute("PRAGMA table_info(delivery_offices)")
print('delivery_offices columns:', [r[1] for r in c.fetchall()])
conn.close()
