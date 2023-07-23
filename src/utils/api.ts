export async function requestPluginApiEndpoint(apiPath: string,
  endpoint: string, payload?: Record<string, any>, method: 'POST' | 'GET' = 'GET') {

  const headers = {
    'Accept': 'application/json',
    'Content-Type': 'application/json'
  };

  switch (method) {
    case 'GET': {
      const qs = payload ? `?${(new URLSearchParams(payload)).toString()}` : '';
      const url = `${apiPath}${endpoint}${qs}`;
      const res = await fetch(url, {
        method: 'GET',
        headers
      });
      return res.json();
    }
    case 'POST': {
      const url = `${apiPath}${endpoint}`;
      const fetchParams: RequestInit = {
        method: 'POST',
        headers
      };
      if (payload) {
        fetchParams.body = JSON.stringify(payload);
      }
      const res = await fetch(url, fetchParams);
      return res.json();
    }
    default:
      return null;
  }
}
