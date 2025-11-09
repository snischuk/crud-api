import request from 'supertest';
import { createServer, IncomingMessage, ServerResponse } from 'http';
import { usersControllerIPC } from '../src/controllers/users.controller';
import type { User } from '../src/models/user.model';

let server: ReturnType<typeof createServer>;
let db: User[] = [];

beforeAll(() => {
  server = createServer(async (req: IncomingMessage, res: ServerResponse) => {
    let body = '';
    req.on('data', chunk => (body += chunk));
    req.on('end', async () => {
      const result = await usersControllerIPC({
        url: req.url,
        method: req.method,
        body,
        database: db,
      });

      if (result && typeof result === 'object' && 'action' in result) {
        if (result.action === 'create' && result.user) db.push(result.user);
        if (result.action === 'update' && result.user) {
          const index = db.findIndex(u => u.id === result.user!.id);
          if (index !== -1) db[index] = result.user;
        }
        if (result.action === 'delete' && result.userId) {
          const index = db.findIndex(u => u.id === result.userId);
          if (index !== -1) db.splice(index, 1);
        }
      }

      const status =
        result && typeof result === 'object' && 'status' in result && result.status
          ? result.status
          : 200;

      res.writeHead(status, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify(result ?? {}));
    });
  }).listen(4000);
});

afterAll(() => {
  server.close();
});

beforeEach(() => {
  db.length = 0;
});

describe('Users API Integration Tests', () => {

  it('GET /api/users should return empty array', async () => {
    const res = await request(server).get('/api/users');
    expect(res.status).toBe(200);
    expect(res.body).toEqual([]);
  });

  it('POST /api/users should create new user', async () => {
    const newUser = { username: 'Max', age: 30, hobbies: ['gaming'] };
    const res = await request(server)
      .post('/api/users')
      .set('Content-Type', 'application/json')
      .send(JSON.stringify(newUser));

    expect(res.status).toBe(200);
    expect(res.body.user).toHaveProperty('id');
    expect(res.body.user.username).toBe('Max');
  });

  it('GET /api/users/:id should return created user', async () => {
    const newUser = { username: 'Max', age: 30, hobbies: ['gaming'] };
    const postRes = await request(server)
      .post('/api/users')
      .set('Content-Type', 'application/json')
      .send(JSON.stringify(newUser));

    const userId = postRes.body.user.id;

    const res = await request(server).get(`/api/users/${userId}`);
    expect(res.status).toBe(200);
    expect(res.body.id).toBe(userId);
    expect(res.body.username).toBe('Max');
  });

  it('PUT /api/users/:id should update user', async () => {
    const newUser = { username: 'Max', age: 30, hobbies: ['gaming'] };
    const postRes = await request(server)
      .post('/api/users')
      .set('Content-Type', 'application/json')
      .send(JSON.stringify(newUser));

    const userId = postRes.body.user.id;

    const updatedUser = { username: 'MaxUpdated', age: 31, hobbies: ['gaming'] };
    const res = await request(server)
      .put(`/api/users/${userId}`)
      .set('Content-Type', 'application/json')
      .send(JSON.stringify(updatedUser));

    expect(res.status).toBe(200);
    expect(res.body.user.username).toBe('MaxUpdated');
  });

  it('DELETE /api/users/:id should delete user', async () => {
    const newUser = { username: 'Max', age: 30, hobbies: ['gaming'] };
    const postRes = await request(server)
      .post('/api/users')
      .set('Content-Type', 'application/json')
      .send(JSON.stringify(newUser));

    const userId = postRes.body.user.id;

    const res = await request(server).delete(`/api/users/${userId}`);
    expect(res.status).toBe(200);
    expect(res.body.userId).toBe(userId);
  });

  it('GET /api/users/:id should return 404 after deletion', async () => {
    const newUser = { username: 'Max', age: 30, hobbies: ['gaming'] };
    const postRes = await request(server)
      .post('/api/users')
      .set('Content-Type', 'application/json')
      .send(JSON.stringify(newUser));

    const userId = postRes.body.user.id;

    await request(server).delete(`/api/users/${userId}`);

    const res = await request(server).get(`/api/users/${userId}`);
    expect(res.status).toBe(404);
  });
});
