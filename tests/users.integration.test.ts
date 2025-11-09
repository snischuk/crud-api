import request from 'supertest';
import { spawn, ChildProcessWithoutNullStreams } from 'child_process';
import path from 'path';

let serverProcess: ChildProcessWithoutNullStreams;
const BASE_URL = 'http://localhost:4000';

beforeAll(done => {
  const clusterPath = path.resolve(__dirname, '../dist/cluster.js');
  serverProcess = spawn('node', [clusterPath]);

  serverProcess.stdout.on('data', (data: Buffer) => {
    if (data.toString().includes('Load balancer listening')) {
      done();
    }
  });

  serverProcess.stderr.on('data', (data: Buffer) => {
    console.error(`Server stderr: ${data}`);
  });

  serverProcess.on('exit', code => {
    console.log(`Server exited with code ${code}`);
  });
});

afterAll(() => {
  if (serverProcess) {
    serverProcess.kill();
  }
});

describe('Users API integration tests', () => {
  let userId: string;

  it('GET /api/users should return empty array', async () => {
    const res = await request(BASE_URL).get('/api/users');
    expect(res.status).toBe(200);
    expect(res.body).toEqual([]);
  });

  it('POST /api/users should create new user', async () => {
    const newUser = { username: 'Max', age: 30, hobbies: ['coding'] };
    const res = await request(BASE_URL).post('/api/users').send(newUser);
    expect(res.status).toBe(200);
    expect(res.body.user).toHaveProperty('id');
    expect(res.body.user.username).toBe('Max');
    userId = res.body.user.id;
  });

  it('GET /api/users/:id should return created user', async () => {
    const res = await request(BASE_URL).get(`/api/users/${userId}`);
    expect(res.status).toBe(200);
    expect(res.body.id).toBe(userId);
  });

  it('PUT /api/users/:id should update user', async () => {
    const updatedUser = { username: 'MaxUpdated', age: 31, hobbies: ['gaming'] };
    const res = await request(BASE_URL).put(`/api/users/${userId}`).send(updatedUser);
    expect(res.status).toBe(200);
    expect(res.body.user.username).toBe('MaxUpdated');
  });

  it('DELETE /api/users/:id should delete user', async () => {
    const res = await request(BASE_URL).delete(`/api/users/${userId}`);
    expect(res.status).toBe(200);
    expect(res.body.userId).toBe(userId);
  });

  it('GET /api/users/:id should return 404 after deletion', async () => {
    const res = await request(BASE_URL).get(`/api/users/${userId}`);
    expect(res.status).toBe(404);
  });
});
