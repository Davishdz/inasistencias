// Función intermediaria de Netlify: el navegador llama a este endpoint
// del mismo sitio y esta función comunica el formulario con Apps Script.
const APPS_SCRIPT_URL = 'https://script.google.com/macros/s/AKfycbwYWkckrpm1l8vgoLOOEFm6g8B-raAAOhWwIqvnh0nvv1t1kTQRPz4Yk5BtOOu2l2whDA/exec';

exports.handler = async (event) => {
  if (event.httpMethod !== 'POST') {
    return { statusCode: 405, headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ status: 'error', message: 'Método no permitido.' }) };
  }

  try {
    const datos = JSON.parse(event.body || '{}');
    if (!datos.estudiante || !datos.fecha || !datos.motivo) {
      return { statusCode: 400, headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: 'error', message: 'Complete nombre, fecha y motivo.' }) };
    }

    const respuesta = await fetch(APPS_SCRIPT_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'text/plain;charset=utf-8' },
      body: JSON.stringify(datos),
      redirect: 'follow'
    });

    const texto = await respuesta.text();
    let resultado;
    try {
      resultado = JSON.parse(texto);
    } catch {
      throw new Error('Google Apps Script no devolvió JSON. Revise que la aplicación esté implementada para que cualquiera pueda acceder.');
    }

    return {
      statusCode: respuesta.ok && resultado.status === 'success' ? 200 : 400,
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(resultado)
    };
  } catch (error) {
    return {
      statusCode: 502,
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ status: 'error', message: error.message || 'No fue posible comunicarse con Google Apps Script.' })
    };
  }
};
