import { test, expect } from '@playwright/test';

test('deberia loguear y redirigir a inicio', async ({ page }) => {
  page.on('console', msg => console.log('>> ', msg.type(), msg.text()));
  page.on('pageerror', err => console.log('PAGE ERROR:', err.message));

  // Ir al login
  await page.goto('http://localhost:4200/login');
  await page.waitForSelector('input[type="password"]');

  // Llenar y enviar
  await page.fill('input[formcontrolname="nombreUsuario"]', 'orlando');
  await page.fill('input[type="password"]', 'Orlando1302*');
  await page.click('p-button[type="submit"] button');

  // Esperar que cambie la URL
  await page.waitForURL('**/inicio', { timeout: 10000 });
  console.log('URL:', page.url());

  // Evaluar JS directo sin bloquear la página
  const title = await page.evaluate(() => document.title);
  console.log('Title:', title);

  const hasBody = await page.evaluate(() => !!document.body);
  console.log('Has body:', hasBody);

  const innerHTML = await page.evaluate(() => document.body?.innerHTML?.substring(0, 300));
  console.log('Body HTML:', innerHTML);
});
