document.addEventListener('DOMContentLoaded', function() {

  const workContainer = document.querySelector('#work-container');
  const workURL = `http://localhost:3000/work`;
  const workForm = document.querySelector('#work-form');
  let allwork = [];

  // Gera o HTML do Card do Pokémon (3 colunas responsivas)
  function renderProjectCard(work) {
    return `
      <div class="col-sm-6 col-lg-4 mb-4" id="work-${work.id}">
        <div class="card h-100 shadow-sm">
          <img src="${work.image}" class="card-img-top bg-white p-2" alt="Foto de ${work.name}" style="height: 180px; object-fit: contain;">
          <div class="card-body">
            <span class="badge badge-primary mb-2">${work.type}</span>
            <h5 class="card-title font-weight-bold text-dark">${work.name}</h5>
            <p class="card-text text-muted small">Gênero: ${work.gender}</p>
          </div>
          <div class="card-footer bg-transparent border-top-0 d-flex justify-content-end gap-2 pb-3">
            <button class="btn btn-sm btn-outline-secondary mr-2" data-id="${work.id}" id="edit-${work.id}" data-action="edit">Editar</button>
            <button class="btn btn-sm btn-outline-danger" data-id="${work.id}" id="delete-${work.id}" data-action="delete">Excluir</button>
          </div>
          <div id="edit-work-${work.id}" class="px-3 pb-3"></div>
        </div>
      </div>
    `;
  }

  // --- READ: Buscar e listar os Pokémon ---
  fetch(`${workURL}`)
    .then(response => response.json())
    .then(workData => {
      allwork = workData;
      workContainer.innerHTML = ""; // Limpa o container
      workData.forEach(function(work) {
        workContainer.innerHTML += renderProjectCard(work);
      });
    });

  // --- CREATE: Adicionar novo Pokémon ---
  workForm.addEventListener('submit', (e) => {
    e.preventDefault();

    const nameInput = workForm.querySelector('#name').value;
    const typeInput = workForm.querySelector('#type').value;
    const genderInput = workForm.querySelector('#gender').value;
    const imageInput = workForm.querySelector('#image').value;

    fetch(`${workURL}`, {
      method: 'POST',
      body: JSON.stringify({
        name: nameInput,
        type: typeInput,
        gender: genderInput,
        image: imageInput
      }),
      headers: { 'Content-Type': 'application/json' }
    })
    .then(response => response.json())
    .then(work => {
      allwork.push(work);
      workContainer.innerHTML += renderProjectCard(work);
      workForm.reset(); // Limpa os campos do formulário após o envio
    });
  });

  // --- UPDATE & DELETE: Delegação de eventos no container ---
  workContainer.addEventListener('click', (e) => {
    
    // Ação: Editar
    if (e.target.dataset.action === 'edit') {
      const projectId = e.target.dataset.id;
      const editButton = document.querySelector(`#edit-${projectId}`);
      editButton.disabled = true;

      const workData = allwork.find(work => work.id == projectId);
      const editFormContainer = workContainer.querySelector(`#edit-work-${projectId}`);
      
      // Injeta o formulário de edição dentro do próprio card
      editFormContainer.innerHTML = `
        <form id="form-edit-${projectId}" class="border-top pt-3 mt-2">
          <div class="form-group mb-2">
            <input required class="form-control form-control-sm" id="edit-name" value="${workData.name}" placeholder="Nome">
          </div>
          <div class="form-group mb-2">
            <input required class="form-control form-control-sm" id="edit-type" value="${workData.type}" placeholder="Tipo">
          </div>
          <div class="form-group mb-2">
            <select class="form-control form-control-sm" id="edit-gender">
              <option value="Sem gênero fixo">Sem gênero fixo</option>
              <option value="Sempre macho">Sempre macho ♂</option>
              <option value="Sempre fêmea">Sempre fêmea ♀</option>
              <option value="Sem gênero">Sem gênero (assexuado)</option>
            </select>
          </div>
          <div class="form-group mb-2">
            <input required class="form-control form-control-sm" id="edit-image" value="${workData.image}" placeholder="URL da Foto">
          </div>
          <button type="submit" class="btn btn-sm btn-success btn-block">Salvar Alterações</button>
        </form>
      `;

      // Seleciona no campo de gênero o valor atual do Pokémon
      const currentEditForm = document.querySelector(`#form-edit-${projectId}`);
      currentEditForm.querySelector("#edit-gender").value = workData.gender;

      // Evento de submit do formulário de edição criado dinamicamente
      currentEditForm.addEventListener("submit", (eventSubmit) => {
        eventSubmit.preventDefault();

        const nameInput = currentEditForm.querySelector("#edit-name").value;
        const typeInput = currentEditForm.querySelector("#edit-type").value;
        const genderInput = currentEditForm.querySelector("#edit-gender").value;
        const imageInput = currentEditForm.querySelector("#edit-image").value;
        
        // Elemento da coluna inteira que será substituído
        const oldCardColumn = document.querySelector(`#work-${projectId}`);

        fetch(`${workURL}/${projectId}`, {
          method: 'PATCH',
          body: JSON.stringify({
            name: nameInput,
            type: typeInput,
            gender: genderInput,
            image: imageInput
          }),
          headers: { 'Content-Type': 'application/json' }
        })
        .then(response => response.json())
        .then(updatedwork => {
          // Atualiza o objeto no array local de controle
          const index = allwork.findIndex(b => b.id == projectId);
          allwork[index] = updatedwork;

          // Substitui a coluna inteira antiga pelo card atualizado
          oldCardColumn.outerHTML = renderProjectCard(updatedwork);
        });
      });

    // Ação: Excluir
    } else if (e.target.dataset.action === 'delete') {
      const projectId = e.target.dataset.id;
      
      // Remove visualmente a coluna que envelopa o card correspondente
      document.querySelector(`#work-${projectId}`).remove();
      
      fetch(`${workURL}/${projectId}`, {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' }
      });
    }
  });

});
