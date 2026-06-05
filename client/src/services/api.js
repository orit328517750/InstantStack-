// API service for InstantStack platform (Pure JavaScript)
const API_BASE_URL = 'http://localhost:8080/api'; 

function parseJwt(token) {
  try {
    const base64Url = token.split('.')[1];
    const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
    const jsonPayload = decodeURIComponent(
      window
        .atob(base64)
        .split('')
        .map(c => '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2))
        .join('')
    );
    return JSON.parse(jsonPayload);
  } catch (e) {
    return null;
  }
}

export const api = {
  // ─── Auth & Users ───────────────────────────────────────
  async login(email, password) {
    const response = await fetch(`${API_BASE_URL}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password }),
    });

    if (!response.ok) {
      throw new Error('Invalid email or password');
    }

    const token = await response.text();
    return token; 
  },

  async addUser(userData) {
    try {
      const response = await fetch(`${API_BASE_URL}/Users`, { 
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(userData),
      });

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(errorText || 'Failed to register user');
      }

      const contentType = response.headers.get("content-type");
      if (contentType && contentType.includes("application/json")) {
        return await response.json();
      }
      return await response.text();
    } catch (error) {
      console.error("API Register Error:", error);
      throw error;
    }
  },

  async getUsers() {
    const token = localStorage.getItem('token');
    const response = await fetch(`${API_BASE_URL}/Users`, {
      headers: {
        'Authorization': `Bearer ${token}`,
      },
    });

    if (!response.ok) {
      throw new Error('Failed to fetch corporate directory');
    }

    return response.json();
  },

  // שליפת עובדים לפי תפקיד מתוך AppUserController האמיתי בג'אווה
  async getAvailableEmployees() {
    const token = localStorage.getItem('token');
    const response = await fetch(`${API_BASE_URL}/Users/role/Employee`, {
      headers: {
        'Authorization': `Bearer ${token}`,
      },
    });

    if (!response.ok) {
      throw new Error('Failed to fetch available developer nodes');
    }

    return response.json();
  },

  // שליפת מנהלים לפי תפקיד מתוך AppUserController
async getAvailableManagers() {
  const token = localStorage.getItem('token');
  const response = await fetch(`${API_BASE_URL}/Users/role/Manager`, {
    headers: {
      'Authorization': `Bearer ${token}`,
    },
  });

  if (!response.ok) {
    throw new Error('Failed to fetch available managers');
  }

  return response.json();
},

  // ─── Projects ───────────────────────────────────────────
  async getProjects() {
    const token = localStorage.getItem('token');
    const response = await fetch(`${API_BASE_URL}/projects`, {
      headers: {
        'Authorization': `Bearer ${token}`,
      },
    });

    if (!response.ok) {
      throw new Error('Failed to fetch projects');
    }

    return response.json();
  },

  async getProject(projectId) {
    const token = localStorage.getItem('token');
    const response = await fetch(`${API_BASE_URL}/projects/${projectId}`, {
      headers: {
        'Authorization': `Bearer ${token}`,
      },
    });

    if (!response.ok) {
      throw new Error('Failed to fetch project');
    }

    return response.json();
  },

  // יצירת פרויקט חדש בשרת - אורית
  async addProject(projectData) {
    const token = localStorage.getItem('token');
    const response = await fetch(`${API_BASE_URL}/projects`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`,
      },
      body: JSON.stringify(projectData),
    });

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(errorText || 'Failed to create project');
    }

    const contentType = response.headers.get('content-type');
    if (contentType && contentType.includes('application/json')) {
      return response.json();
    }
    return response.text();
  },


  // עדכון פרויקט קיים (מפעיל @PutMapping ב-ProjectController בג'אווה)
  async updateProject(projectData) {
    const token = localStorage.getItem('token');
    const response = await fetch(`${API_BASE_URL}/projects`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`,
      },
      body: JSON.stringify(projectData),
    });

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(errorText || 'Failed to update project matrix');
    }

    return response.text(); // מחזיר את הודעת ה-String מה-Backend
  },

  // שיוך עובד לפרויקט מתוך ProjectController האמיתי בג'אווה
  async assignWorkerToProject(projectId, workerId) {
    const token = localStorage.getItem('token');
    const response = await fetch(`${API_BASE_URL}/projects/${projectId}/workers/${workerId}`, {
      method: 'PUT',
      headers: {
        'Authorization': `Bearer ${token}`,
      }
    });

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(errorText || 'Failed to link worker node to pipeline matrix');
    }
    
    return response.text(); // מחזיר את מחרוזת ההצלחה של הג'אווה
  },

  // ─── Environments ───────────────────────────────────────
  async createEnvironment(projectId, workerId) {
    const token = localStorage.getItem('token');
    const url = `${API_BASE_URL}/projects/${projectId}/environments?workerId=${workerId}`;

    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`,
      },
    });

    if (!response.ok) {
      throw new Error(`Failed to create environment. Status: ${response.status}`);
    }

    return response.json();
  },

  async updateEnvironment(envId, data) {
    const token = localStorage.getItem('token');
    const response = await fetch(`${API_BASE_URL}/environments/${envId}`, {
      method: 'PUT',
      headers: { 
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify(data)
    });

    if (!response.ok) throw new Error('Network response was not ok');

    const contentType = response.headers.get("content-type");
    if (contentType && contentType.includes("application/json")) {
      return await response.json();
    } else {
      const textData = await response.text();
      return { message: textData };
    }
  },
  

  async getProjectEnvironments(projectId) {
    const token = localStorage.getItem('token');
    const response = await fetch(`${API_BASE_URL}/projects/${projectId}/environments`, {
      headers: {
        'Authorization': `Bearer ${token}`,
      },
    });

    if (!response.ok) {
      throw new Error('Failed to fetch environments');
    }

    return response.json();
  },

  async deleteEnvironment(projectId, envId) {
    const token = localStorage.getItem('token');
    const response = await fetch(`${API_BASE_URL}/projects/${projectId}/environments/${envId}`, {
      method: 'DELETE',
      headers: {
        'Authorization': `Bearer ${token}`,
      },
    });

    if (!response.ok) {
      throw new Error('Failed to delete environment');
    }

    // השרת מחזיר הודעת String פשוטה ("Environment X deleted successfully...")
    return response.text();
  },
  // ─── הוספה ל-API (מחיקה ועדכון) ──────────────────────────
  
  // מחיקת משתמש
  async deleteUser(userId) {
    const token = localStorage.getItem('token');
    const response = await fetch(`${API_BASE_URL}/Users/${userId}`, {
      method: 'DELETE',
      headers: { 'Authorization': `Bearer ${token}` },
    });
    if (!response.ok) throw new Error('Failed to delete user');
    return response.text();
  },

  // מחיקת פרויקט
  async deleteProject(projectId) {
    const token = localStorage.getItem('token');
    const response = await fetch(`${API_BASE_URL}/projects/${projectId}`, {
      method: 'DELETE',
      headers: { 'Authorization': `Bearer ${token}` },
    });
    if (!response.ok) throw new Error('Failed to delete project');
    return response.text();
  },

  // עדכון פרטי משתמש (שם ואימייל בלבד)
  async updateUserDetails(userId, userData) {
    const token = localStorage.getItem('token');
    const url = `${API_BASE_URL}/Users/${userId}`;
    const response = await fetch(url, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`,
      },
      body: JSON.stringify(userData),
    });

    const contentType = response.headers.get('content-type');
    const responseText = await response.text();

    if (!response.ok) {
      throw new Error(responseText || 'Failed to update user details');
    }

    if (contentType && contentType.includes('application/json')) {
      return JSON.parse(responseText);
    }

    return responseText;
  },

  // עדכון תפקיד משתמש
  async updateUserRole(userId, newRole) {
    const token = localStorage.getItem('token');
    const url = `${API_BASE_URL}/Users/${userId}/role`;
    const response = await fetch(url, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`,
      },
      body: JSON.stringify(newRole),
    });

    const contentType = response.headers.get('content-type');
    const responseText = await response.text();

    if (!response.ok) {
      throw new Error(responseText || 'Failed to update user role');
    }

    if (contentType && contentType.includes('application/json')) {
      return JSON.parse(responseText);
    }

    return responseText;
  },
async getMyWorkers() {
  const token = localStorage.getItem('token');
  
  // הכתובת המלאה תהיה: http://localhost:8080/api/projects/my-workers
  const response = await fetch(`${API_BASE_URL}/projects/my-workers`, {
    method: 'GET',
    headers: {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json'
    }
  });

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(errorText || 'Failed to fetch my workers');
  }

  return response.json();
},
  // ────────────────────────────────────────────────────────
};

export function getRoleFromToken() {
  const token = localStorage.getItem('token');
  if (!token) return null;
  const payload = parseJwt(token);
  return payload ? payload.role : null; 
}

export function getEmailFromToken() {
  const token = localStorage.getItem('token');
  if (!token) return null;
  const payload = parseJwt(token);
  return payload ? payload.sub || payload.email : null;
}
