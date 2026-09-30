import { test, expect } from '@playwright/test';

const API_BASE = 'http://localhost:4000/api';

test.describe('Configurateur — compatibilité des pièces', () => {
  test('le boîtier "Pierre claire 36mm" ne propose que les cadrans compatibles', async ({ request }) => {
    // 1. Récupérer tous les boîtiers, pour trouver l'id réel de "Pierre claire 36mm"
    const boitiersResponse = await request.get(`${API_BASE}/configurator/pieces?type=BOITIER`);
    expect(boitiersResponse.ok()).toBeTruthy();
    const boitiers = await boitiersResponse.json();

    const pierreBoitier = boitiers.find((p: any) => p.name === 'Pierre claire 36mm');
    expect(pierreBoitier).toBeDefined();

    // 2. Demander les cadrans compatibles avec CE boîtier précis
    const cadransResponse = await request.get(
      `${API_BASE}/configurator/pieces?type=CADRAN&selected=${pierreBoitier.id}`
    );
    expect(cadransResponse.ok()).toBeTruthy();
    const cadrans = await cadransResponse.json();

    // 3. La règle métier attendue : uniquement Nacre et Bleu marine, rien d'autre
    const noms = cadrans.map((c: any) => c.name).sort();
    expect(noms).toEqual(['Bleu marine', 'Nacre']);
  });
});