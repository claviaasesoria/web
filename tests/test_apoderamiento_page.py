from pathlib import Path
import unittest


PAGE = Path(__file__).parents[1] / "apoderamiento" / "index.html"


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


if __name__ == "__main__":
    unittest.main()
