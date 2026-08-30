A component where you can input images, they shuffle, and as you scroll, they scale side by side, the previous on the left, the upcoming on the right.
-> Maybe implementing a slider that allows the user to modify the speed, or this is handled though other interaction?

Updating the lenis component, f.i via changing syncTouch, seems to fix the homepage scroll interia issue causing gaps between projectpreview scale.

The image starts fullscreen, and on scroll it blurs, so the rest of the page scrolls over the blurred image, the blurred image becomes the background
