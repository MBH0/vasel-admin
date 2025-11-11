<script lang="ts">
	export let service: any;
	export let language: 'es' | 'en';
	export let onSave: (updatedService: any) => void;
	export let onCancel: () => void;

	// Create a deep copy to edit
	let editedService = JSON.parse(JSON.stringify(service));

	// Helper to join/split benefits
	let benefitsText = editedService.benefits ? editedService.benefits : '';
	let documentsText = editedService.required_documents?.required_documents?.join('\n') || '';
	let tagsText = editedService.tags?.join(', ') || '';

	function handleSave() {
		// Update benefits
		editedService.benefits = benefitsText;

		// Update documents
		if (editedService.required_documents) {
			editedService.required_documents.required_documents = documentsText
				.split('\n')
				.map(d => d.trim())
				.filter(d => d);
		}

		// Update tags
		editedService.tags = tagsText.split(',').map(t => t.trim()).filter(t => t);

		onSave(editedService);
	}

	const config = {
		es: {flag: '🇪🇸', title: 'Editar Versión Española'},
		en: {flag: '🇬🇧', title: 'Edit English Version'}
	};
	const langConfig = config[language];

	// Process steps management
	function addProcessStep() {
		if (!editedService.process_steps) {
			editedService.process_steps = [];
		}
		editedService.process_steps = [...editedService.process_steps, {
			step_number: editedService.process_steps.length + 1,
			title: '',
			description: '',
			estimated_time: ''
		}];
	}

	function removeProcessStep(index: number) {
		editedService.process_steps = editedService.process_steps.filter((_: any, i: number) => i !== index);
		// Renumber steps
		editedService.process_steps.forEach((step: any, i: number) => {
			step.step_number = i + 1;
		});
	}

	// FAQ management
	function addFAQ() {
		if (!editedService.faq) {
			editedService.faq = [];
		}
		editedService.faq = [...editedService.faq, {
			question: '',
			answer: ''
		}];
	}

	function removeFAQ(index: number) {
		editedService.faq = editedService.faq.filter((_: any, i: number) => i !== index);
	}
</script>

<div class="bg-white rounded-xl border-2 border-gray-300 p-6 space-y-6">
	<div class="flex items-center justify-between border-b pb-4">
		<h3 class="text-xl font-bold text-gray-900 flex items-center gap-2">
			<span class="text-2xl">{langConfig.flag}</span>
			{langConfig.title}
		</h3>
	</div>

	<!-- Basic Information -->
	<div class="space-y-4">
		<h4 class="font-semibold text-gray-900 text-lg">Información Básica</h4>

		<div class="grid md:grid-cols-2 gap-4">
			<div>
				<label for="name-{language}" class="label">Nombre del Servicio</label>
				<input
					id="name-{language}"
					type="text"
					bind:value={editedService.name}
					class="input"
					required
				/>
			</div>

			<div>
				<label for="slug-{language}" class="label">Slug</label>
				<input
					id="slug-{language}"
					type="text"
					bind:value={editedService.slug}
					class="input"
					required
				/>
			</div>
		</div>

		<div>
			<label for="description-{language}" class="label">Descripción</label>
			<textarea
				id="description-{language}"
				bind:value={editedService.description}
				class="input min-h-[120px] resize-y"
				rows="4"
				required
			></textarea>
		</div>

		<div>
			<label for="target-audience-{language}" class="label">Público Objetivo</label>
			<input
				id="target-audience-{language}"
				type="text"
				bind:value={editedService.target_audience}
				class="input"
			/>
		</div>
	</div>

	<!-- Service Details -->
	<div class="space-y-4">
		<h4 class="font-semibold text-gray-900 text-lg">Detalles del Servicio</h4>

		<div class="grid md:grid-cols-2 lg:grid-cols-4 gap-4">
			<div>
				<label for="price-{language}" class="label">Rango de Precio</label>
				<input
					id="price-{language}"
					type="text"
					bind:value={editedService.price_range}
					class="input"
					placeholder="€500 - €1000"
				/>
			</div>

			<div>
				<label for="duration-{language}" class="label">Duración</label>
				<input
					id="duration-{language}"
					type="text"
					bind:value={editedService.duration}
					class="input"
					placeholder="2-4 semanas"
				/>
			</div>

			<div>
				<label for="complexity-{language}" class="label">Complejidad</label>
				<select
					id="complexity-{language}"
					bind:value={editedService.complexity}
					class="input"
				>
					<option value="Básico">Básico</option>
					<option value="Intermedio">Intermedio</option>
					<option value="Avanzado">Avanzado</option>
				</select>
			</div>

			<div>
				<label for="success-{language}" class="label">Tasa de Éxito</label>
				<input
					id="success-{language}"
					type="text"
					bind:value={editedService.success_rate}
					class="input"
					placeholder="95%"
				/>
			</div>
		</div>
	</div>

	<!-- Benefits -->
	<div class="space-y-4">
		<h4 class="font-semibold text-gray-900 text-lg">Beneficios</h4>
		<div>
			<label for="benefits-{language}" class="label">Beneficios (uno por línea)</label>
			<textarea
				id="benefits-{language}"
				bind:value={benefitsText}
				class="input min-h-[150px] resize-y"
				rows="6"
				placeholder="Asesoría personalizada&#10;Gestión completa de documentos&#10;Seguimiento continuo del proceso"
			></textarea>
			<p class="mt-1 text-sm text-gray-500">Escribe cada beneficio en una nueva línea</p>
		</div>
	</div>

	<!-- Process Steps -->
	<div class="space-y-4">
		<div class="flex items-center justify-between">
			<h4 class="font-semibold text-gray-900 text-lg">Pasos del Proceso</h4>
			<button
				type="button"
				on:click={addProcessStep}
				class="text-sm px-3 py-1 bg-emerald-100 text-emerald-700 rounded-lg hover:bg-emerald-200 transition-colors"
			>
				+ Agregar Paso
			</button>
		</div>

		{#if editedService.process_steps && editedService.process_steps.length > 0}
			<div class="space-y-3">
				{#each editedService.process_steps as step, index}
					<div class="p-4 bg-gray-50 rounded-lg border border-gray-200 space-y-3">
						<div class="flex items-center justify-between">
							<span class="font-semibold text-gray-700">Paso {index + 1}</span>
							<button
								type="button"
								on:click={() => removeProcessStep(index)}
								class="text-red-600 hover:text-red-800 text-sm"
							>
								✕ Eliminar
							</button>
						</div>

						<div class="grid md:grid-cols-2 gap-3">
							<div>
								<label class="label text-sm">Título</label>
								<input
									type="text"
									bind:value={step.title}
									class="input"
									placeholder="Título del paso"
								/>
							</div>

							<div>
								<label class="label text-sm">Tiempo Estimado</label>
								<input
									type="text"
									bind:value={step.estimated_time}
									class="input"
									placeholder="1-2 días"
								/>
							</div>
						</div>

						<div>
							<label class="label text-sm">Descripción</label>
							<textarea
								bind:value={step.description}
								class="input min-h-[80px]"
								rows="3"
								placeholder="Descripción del paso"
							></textarea>
						</div>
					</div>
				{/each}
			</div>
		{:else}
			<p class="text-gray-500 text-sm italic">No hay pasos del proceso. Haz clic en "Agregar Paso" para añadir uno.</p>
		{/if}
	</div>

	<!-- Required Documents -->
	<div class="space-y-4">
		<h4 class="font-semibold text-gray-900 text-lg">Documentos Requeridos</h4>
		<div>
			<label for="documents-{language}" class="label">Documentos (uno por línea)</label>
			<textarea
				id="documents-{language}"
				bind:value={documentsText}
				class="input min-h-[150px] resize-y"
				rows="6"
				placeholder="Pasaporte vigente&#10;NIE&#10;Certificado de empadronamiento"
			></textarea>
			<p class="mt-1 text-sm text-gray-500">Escribe cada documento en una nueva línea</p>
		</div>
	</div>

	<!-- FAQ -->
	<div class="space-y-4">
		<div class="flex items-center justify-between">
			<h4 class="font-semibold text-gray-900 text-lg">Preguntas Frecuentes (FAQ)</h4>
			<button
				type="button"
				on:click={addFAQ}
				class="text-sm px-3 py-1 bg-emerald-100 text-emerald-700 rounded-lg hover:bg-emerald-200 transition-colors"
			>
				+ Agregar FAQ
			</button>
		</div>

		{#if editedService.faq && editedService.faq.length > 0}
			<div class="space-y-3">
				{#each editedService.faq as faqItem, index}
					<div class="p-4 bg-gray-50 rounded-lg border border-gray-200 space-y-3">
						<div class="flex items-center justify-between">
							<span class="font-semibold text-gray-700">FAQ {index + 1}</span>
							<button
								type="button"
								on:click={() => removeFAQ(index)}
								class="text-red-600 hover:text-red-800 text-sm"
							>
								✕ Eliminar
							</button>
						</div>

						<div>
							<label class="label text-sm">Pregunta</label>
							<input
								type="text"
								bind:value={faqItem.question}
								class="input"
								placeholder="¿Cuál es la pregunta?"
							/>
						</div>

						<div>
							<label class="label text-sm">Respuesta</label>
							<textarea
								bind:value={faqItem.answer}
								class="input min-h-[100px]"
								rows="3"
								placeholder="Escribe la respuesta aquí..."
							></textarea>
						</div>
					</div>
				{/each}
			</div>
		{:else}
			<p class="text-gray-500 text-sm italic">No hay preguntas frecuentes. Haz clic en "Agregar FAQ" para añadir una.</p>
		{/if}
	</div>

	<!-- Tags -->
	<div class="space-y-4">
		<h4 class="font-semibold text-gray-900 text-lg">Etiquetas y SEO</h4>

		<div>
			<label for="tags-{language}" class="label">Tags (separados por comas)</label>
			<input
				id="tags-{language}"
				type="text"
				bind:value={tagsText}
				class="input"
				placeholder="inmigración, residencia, nacionalidad"
			/>
			<p class="mt-1 text-sm text-gray-500">Separa cada etiqueta con una coma</p>
		</div>

		{#if editedService.seo}
			<div class="grid md:grid-cols-2 gap-4">
				<div>
					<label for="seo-title-{language}" class="label">SEO Título</label>
					<input
						id="seo-title-{language}"
						type="text"
						bind:value={editedService.seo.meta_title}
						class="input"
						class:border-red-500={editedService.seo.meta_title && editedService.seo.meta_title.length > 60}
					/>
					<p class="mt-1 text-sm" class:text-red-600={editedService.seo.meta_title && editedService.seo.meta_title.length > 60} class:text-gray-500={!editedService.seo.meta_title || editedService.seo.meta_title.length <= 60}>
						{editedService.seo.meta_title ? editedService.seo.meta_title.length : 0}/60 caracteres
						{#if editedService.seo.meta_title && editedService.seo.meta_title.length > 60}
							<span class="font-semibold">(¡Excede el límite!)</span>
						{/if}
					</p>
				</div>

				<div>
					<label for="seo-keywords-{language}" class="label">SEO Keywords</label>
					<input
						id="seo-keywords-{language}"
						type="text"
						bind:value={editedService.seo.keywords}
						class="input"
					/>
				</div>
			</div>

			<div>
				<label for="seo-description-{language}" class="label">SEO Descripción</label>
				<textarea
					id="seo-description-{language}"
					bind:value={editedService.seo.meta_description}
					class="input min-h-[80px]"
					class:border-red-500={editedService.seo.meta_description && editedService.seo.meta_description.length > 160}
					rows="3"
				></textarea>
				<p class="mt-1 text-sm" class:text-red-600={editedService.seo.meta_description && editedService.seo.meta_description.length > 160} class:text-gray-500={!editedService.seo.meta_description || editedService.seo.meta_description.length <= 160}>
					{editedService.seo.meta_description ? editedService.seo.meta_description.length : 0}/160 caracteres
					{#if editedService.seo.meta_description && editedService.seo.meta_description.length > 160}
						<span class="font-semibold">(¡Excede el límite!)</span>
					{/if}
				</p>
			</div>
		{/if}
	</div>

	<!-- Action Buttons -->
	<div class="flex gap-3 pt-4 border-t">
		<button
			type="button"
			on:click={handleSave}
			class="btn-success flex-1"
		>
			💾 Guardar Cambios
		</button>
		<button
			type="button"
			on:click={onCancel}
			class="btn-secondary flex-1"
		>
			✕ Cancelar
		</button>
	</div>
</div>
