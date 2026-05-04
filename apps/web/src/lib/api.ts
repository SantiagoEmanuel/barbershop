const URL = import.meta.env.VITE_HOST;

export async function api(endpoint: string, config: RequestInit) {
  const { headers } = config;
  try {
    const data = await fetch(`${URL}/${endpoint}`, {
      headers: {
        "content-type": "application/json",
        ...headers,
      },
      credentials: "include",
      ...config,
    });

    if (!data.ok) {
      throw new Error("Error al obtener información");
    }

    return await data.json();
  } catch (err: any) {
    console.log(JSON.stringify(err));
    return null;
  }
}
