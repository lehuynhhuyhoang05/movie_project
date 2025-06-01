document.querySelectorAll('.tab-link').forEach(link => {
  link.addEventListener('click', function(e) {
    e.preventDefault();
    document.querySelectorAll('.tab-link').forEach(tab => tab.classList.remove('active'));
    this.classList.add('active');

    document.querySelectorAll('.content').forEach(section => section.classList.add('hidden'));
    const target = this.getAttribute('data-target');
    document.getElementById(target).classList.remove('hidden');
  });
});
