// @unocss-include
import { getColorPalette, getRgb } from '@sa/color';
import { DARK_CLASS } from '@/constants/app';
import { localStg } from '@/utils/storage';
import { toggleHtmlClass } from '@/utils/common';
import { $t } from '@/locales';

export function setupLoading() {
  const themeColor = localStg.get('themeColor') || '#646cff';
  const darkMode = localStg.get('darkMode') || false;
  const palette = getColorPalette(themeColor);

  const { r, g, b } = getRgb(themeColor);

  const primaryColor = `--primary-color: ${r} ${g} ${b}`;

  const svgCssVars = Array.from(palette.entries())
    .map(([key, value]) => `--logo-color-${key}: ${value}`)
    .join(';');

  const cssVars = `${primaryColor}; ${svgCssVars}`;

  if (darkMode) {
    toggleHtmlClass(DARK_CLASS).add();
  }

  const loadingClasses = [
    'left-0 top-0',
    'left-0 bottom-0 animate-delay-500',
    'right-0 top-0 animate-delay-1000',
    'right-0 bottom-0 animate-delay-1500'
  ];

  const dot = loadingClasses
    .map(item => {
      return `<div class="absolute w-16px h-16px bg-primary rounded-8px animate-pulse ${item}"></div>`;
    })
    .join('\n');

  const loading = `
<div class="fixed-center flex-col bg-layout" style="${cssVars}">
  <div class="w-128px h-128px">
    ${getLogoSvg()}
  </div>
  <div class="w-56px h-56px my-36px">
    <div class="relative h-full animate-spin">
      ${dot}
    </div>
  </div>
  <h2 class="text-28px font-500 text-primary">${$t('system.title')}</h2>
</div>`;

  const app = document.getElementById('app');

  if (app) {
    app.innerHTML = loading;
  }
}

function getLogoSvg() {
  const logoSvg = `<svg
        width="100%"
        height="100%"
        viewBox="0 0 5088 5071"
        xmlns="http://www.w3.org/2000/svg"
      >
        <g transform="translate(0.000000,5071.000000) scale(0.100000,-0.100000)" fill="#005aa8" stroke="none">
          <path d="M20650 44594 c-2610 -2598 -4860 -4839 -5000 -4979 l-255 -255 10005 0 10005 0 -2490 2487 c-4500 4495 -7273 7257 -7433 7406 -40 37 -76 67 -80 66 -4 0 -2142 -2126 -4752 -4725z"/>
          <path d="M11075 35062 c-577 -577 -2123 -2116 -3435 -3422 -1312 -1306 -2972 -2959 -3690 -3675 -718 -715 -1443 -1438 -1612 -1605 l-307 -305 4914 -4919 4913 -4920 344 330 c188 182 3603 3453 7588 7269 3985 3817 7506 7189 7825 7495 319 306 1552 1487 2740 2624 1188 1138 2185 2093 2215 2122 l55 54 -10250 0 -10250 0 -1050 -1048z"/>
          <path d="M28794 26143 l-9911 -9918 10016 -3 10016 -2 1575 1577 c867 868 3073 3077 4903 4909 1830 1833 3327 3336 3327 3340 0 8 -6772 6781 -9170 9172 l-846 843 -9910 -9918z"/>
          <path d="M15430 12650 c0 -3 2241 -2246 4980 -4985 l4981 -4981 4562 4566 c2510 2511 4748 4752 4975 4980 l411 415 -127 2 c-256 5 -19782 8 -19782 3z"/>
        </g>
      </svg>
  `;

  return logoSvg;
}
