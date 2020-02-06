window.addEventListener('load', function() {
  const pymParent = new pym.Parent(
    'facts-and-figures',
    'https://facts-and-figures-web.netlify.com/index.html',
    {}
  );

  // attempt to tell iframe if we've navigated to specific table
  // const targetIFrame = document.getElementById('facts-and-figures').firstChild;
  // const queries = window.location.search;
  // const params = new URLSearchParams(queries);
  // const table = params.get('table');

  // targetIFrame.postMessage(table);
});
