from pathlib import Path
import unittest


PAGE = Path(__file__).parents[1] / "apoderamiento" / "index.html"
SS_PAGE = Path(__file__).parents[1] / "apoderamiento-seguridad-social" / "index.html"


class ApoderamientoGuideTests(unittest.TestCase):
    def test_includes_three_official_aeat_visual_steps(self):
        page = PAGE.read_text(encoding="utf-8")

        self.assertIn('id="pantallas-aeat"', page)
        self.assertIn('assets/aeat-apoderamiento/poder-general.png', page)
        self.assertIn('assets/aeat-apoderamiento/formulario-poder-general.png', page)
        self.assertIn('assets/aeat-apoderamiento/confirmacion-firma.png', page)
        self.assertIn('Capturas oficiales de la Agencia Tributaria', page)
        self.assertEqual(page.count('class="aeat-screen-link"'), 3)
        self.assertIn('Toca una captura para ampliarla', page)
        self.assertIn('Marca únicamente GENERALLEY58', page)
        self.assertIn('No marques GENERALDATPE ni GENERALNOT', page)
        self.assertIn('class="note warn power-warning"', page)

    def test_includes_social_security_red_confirmation_guide(self):
        self.assertTrue(SS_PAGE.is_file())
        page = SS_PAGE.read_text(encoding="utf-8")

        self.assertIn('id="naf"', page)
        self.assertIn('Confirma la asignación de tu NAF', page)
        self.assertIn('assets/apoderamiento-seguridad-social/red-confirmacion.png', page)
        self.assertIn('assets/apoderamiento-seguridad-social/naf-importass.png', page)
        self.assertIn('PortalRedirectorN1A?idApp=258', page)
        self.assertIn('Guarda el justificante en PDF', page)

    def test_social_security_guide_has_four_linked_client_steps(self):
        page = SS_PAGE.read_text(encoding="utf-8")

        for step_id in ('paso-1-naf', 'paso-2-envio', 'paso-3-confirmacion', 'paso-4-pdf'):
            self.assertIn(f'id="{step_id}"', page)
        self.assertEqual(page.count('class="process-link"'), 4)
        self.assertIn('Qué haces tú', page)
        self.assertIn('Qué hacemos nosotros', page)
        self.assertIn('Ahora mismo', page)
        self.assertIn('Continúa cuando Clavia te confirme que la solicitud ya está enviada.', page)


if __name__ == "__main__":
    unittest.main()
