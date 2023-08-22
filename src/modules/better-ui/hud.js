const showFullTitlePercent = () => {
  const title = document.querySelector('.mousehuntHud-userStat.title');
  if (! title) {
    return;
  }

  const percent = title.getAttribute('title');
  if (! percent) {
    return;
  }

  const target = title.querySelector('.hud_titlePercentage');
  if (! target) {
    return;
  }

  const originalText = target.innerText;

  title.addEventListener('mouseover', () => {
    target.innerText = percent.indexOf('%') > -1 ? percent.split('%')[0] : percent;
  });

  title.addEventListener('mouseout', () => {
    target.innerText = originalText;
  });
};

export default () => {
  showFullTitlePercent();
};
