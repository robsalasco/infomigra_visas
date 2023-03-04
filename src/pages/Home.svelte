<script>
  
  import { navigateTo } from 'yrv';

  let page;

  let questions = [
    { path: '/vs', name: `Valor de visas según país de origen` },
    { path: '/vc', name: `Valor de visas consulares según país de origen` },
    { path: '/pt', name: `Valor de permisos de trabajo según país de origen` },
    { path: '/ss', name: `Valor de la sanciones según cantidad de días y forma de presentación` },
    { path: '/nc', name: `Definitiva y nacionalización` },
    { path: '/rc', name: `Valores de trámites y documentos Registro Civil Chileno` }
  ];

  function handleSubmit() {
    navigateTo(`${page.path}`);
  }


</script>


<style type="text/css">

</style>

<div class="container mx-auto h-full flex justify-center items-center">

  <div class="block relative bg-white shadow-md rounded px-8 pb-8 mb-4 w-12/12">

    <h2 class="text-lg text-black">¿En que te podemos ayudar?</h2>
    <form on:submit|preventDefault={handleSubmit} class="mt-4">
      <div class="inline-block relative w-12/12">
        <select bind:value={page} class="block appearance-none w-full bg-white border border-gray-400 hover:border-gray-500 px-4 py-2 pr-8 rounded shadow leading-tight focus:outline-none focus:shadow-outline">
          {#each questions as question}
          <option value={question}>
            {question.name}
          </option>
          {/each}
        </select>
        <div class="pointer-events-none absolute inset-y-0 right-0 flex items-center px-2 text-gray-700">
          <svg class="fill-current h-4 w-4" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20"><path d="M9.293 12.95l.707.707L15.657 8l-1.414-1.414L10 10.828 5.757 6.586 4.343 8z"/></svg>
        </div>
      </div>
      <button class="flex-shrink-0 bg-teal-500 hover:bg-teal-700 border-teal-500 hover:border-teal-700 text-sm border-4 text-white py-1 px-2 rounded mt-4" type="submit">
      Seleccionar
      </button>
    </form>
</div>
</div>
