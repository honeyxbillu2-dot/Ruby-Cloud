const BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000/api';

const getToken = () => localStorage.getItem('ruby_token');

// Simple fetch wrapper
const request = async (method, path, body) => {
  const headers = { 'Content-Type': 'application/json' };
  const token = getToken();
  if (token) headers['Authorization'] = `Bearer ${token}`;
  const res = await fetch(`${BASE_URL}${path}`, {
    method,
    headers,
    body: body ? JSON.stringify(body) : undefined
  });
  const data = await res.json();
  if (!res.ok) throw { message: data.error || 'Request failed', code: res.status };
  return data;
};

// Supabase-style query builder for backward compatibility
const createQueryBuilder = (table) => {
  let _filters = [];
  let _order = null;
  let _single = false;
  let _limit = null;

  const builder = {
    select: (cols) => builder,
    eq: (col, val) => { _filters.push({ col, val }); return builder; },
    order: (col, opts) => { _order = { col, ...opts }; return builder; },
    single: () => { _single = true; return builder; },
    limit: (n) => { _limit = n; return builder; },

    // Execute GET
    then: (resolve, reject) => {
      const run = async () => {
        try {
          let data = await request('GET', `/${table}`);
          // Apply filters
          _filters.forEach(f => {
            if (Array.isArray(data)) data = data.filter(item => String(item[f.col]) === String(f.val));
          });
          // Apply order
          if (_order && Array.isArray(data)) {
            data.sort((a, b) => _order.ascending ? (a[_order.col] > b[_order.col] ? 1 : -1) : (a[_order.col] < b[_order.col] ? 1 : -1));
          }
          if (_limit && Array.isArray(data)) data = data.slice(0, _limit);
          if (_single) data = Array.isArray(data) ? data[0] : data;
          return { data: data || null, error: null };
        } catch (err) {
          return { data: null, error: err };
        }
      };
      return run().then(resolve, reject);
    },

    // INSERT
    insert: (rows) => ({
      then: (resolve, reject) => {
        const run = async () => {
          try {
            const row = Array.isArray(rows) ? rows[0] : rows;
            const data = await request('POST', `/${table}`, row);
            return { data, error: null };
          } catch (err) { return { data: null, error: err }; }
        };
        return run().then(resolve, reject);
      },
      select: () => ({
        single: () => ({
          then: (resolve, reject) => {
            const run = async () => {
              try {
                const row = Array.isArray(rows) ? rows[0] : rows;
                const data = await request('POST', `/${table}`, row);
                return { data, error: null };
              } catch (err) { return { data: null, error: err }; }
            };
            return run().then(resolve, reject);
          }
        })
      })
    }),

    // UPDATE
    update: (updates) => ({
      eq: (col, val) => ({
        then: (resolve, reject) => {
          const run = async () => {
            try {
              const data = await request('PUT', `/${table}/${val}`, updates);
              return { data, error: null };
            } catch (err) { return { data: null, error: err }; }
          };
          return run().then(resolve, reject);
        },
        select: () => ({
          single: () => ({
            then: (resolve, reject) => {
              const run = async () => {
                try {
                  const data = await request('PUT', `/${table}/${val}`, updates);
                  return { data, error: null };
                } catch (err) { return { data: null, error: err }; }
              };
              return run().then(resolve, reject);
            }
          })
        })
      })
    })
  };
  return builder;
};

export const api = {
  from: (table) => {
    // Map table names to API endpoints
    const tableMap = {
      'paid_plans': 'plans',
      'location_settings': 'locations',
      'site_settings': 'settings',
      'tickets': 'tickets',
      'chat_messages': 'chat',
      'users': 'users',
      'about_content': 'about',
      'yt_partners': 'yt-partners'
    };
    return createQueryBuilder(tableMap[table] || table);
  }
};

// Direct API helpers
export const apiRequest = request;
