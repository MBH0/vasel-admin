<script lang="ts">
	export let blog: any;
	export let language: 'es' | 'en';
	export let onSave: (updatedBlog: any) => void;
	export let onCancel: () => void;

	// Create a deep copy to edit
	let editedBlog = JSON.parse(JSON.stringify(blog));

	// Normalize SEO field to always use uppercase SEO
	if (!editedBlog.SEO && editedBlog.seo) {
		editedBlog.SEO = editedBlog.seo;
		delete editedBlog.seo;
	}

	// Ensure SEO object exists
	if (!editedBlog.SEO) {
		editedBlog.SEO = {
			metaTitle: editedBlog.title || '',
			metaDescription: editedBlog.excerpt || '',
			keywords: ''
		};
	}

	// Normalize SEO field names (convert snake_case to camelCase)
	if (editedBlog.SEO.meta_title) {
		editedBlog.SEO.metaTitle = editedBlog.SEO.meta_title;
		delete editedBlog.SEO.meta_title;
	}
	if (editedBlog.SEO.meta_description) {
		editedBlog.SEO.metaDescription = editedBlog.SEO.meta_description;
		delete editedBlog.SEO.meta_description;
	}

	// Helper to join/split tags
	let tagsText = Array.isArray(editedBlog.tags) ? editedBlog.tags.join(', ') : '';

	function handleSave() {
		// Update tags
		editedBlog.tags = tagsText.split(',').map((t: string) => t.trim()).filter((t: string) => t);

		// Ensure SEO fields are properly formatted
		if (editedBlog.SEO) {
			// Remove any null/undefined values
			Object.keys(editedBlog.SEO).forEach(key => {
				if (editedBlog.SEO[key] === null || editedBlog.SEO[key] === undefined) {
					delete editedBlog.SEO[key];
				}
			});

			// Ensure required fields exist
			if (!editedBlog.SEO.metaTitle) {
				editedBlog.SEO.metaTitle = editedBlog.title;
			}
			if (!editedBlog.SEO.metaDescription) {
				editedBlog.SEO.metaDescription = editedBlog.excerpt || '';
			}
		}

		onSave(editedBlog);
	}

	const config = {
		es: {flag: '🇪🇸', title: 'Editar Versión Española'},
		en: {flag: '🇬🇧', title: 'Edit English Version'}
	};
	const langConfig = config[language];

	// Content blocks management
	function addContentBlock() {
		if (!editedBlog.content) {
			editedBlog.content = [];
		}
		editedBlog.content = [...editedBlog.content, {
			type: 'paragraph',
			text: ''
		}];
	}

	function removeContentBlock(index: number) {
		editedBlog.content = editedBlog.content.filter((_: any, i: number) => i !== index);
	}

	function moveBlockUp(index: number) {
		if (index > 0) {
			const temp = editedBlog.content[index];
			editedBlog.content[index] = editedBlog.content[index - 1];
			editedBlog.content[index - 1] = temp;
			editedBlog.content = [...editedBlog.content];
		}
	}

	function moveBlockDown(index: number) {
		if (index < editedBlog.content.length - 1) {
			const temp = editedBlog.content[index];
			editedBlog.content[index] = editedBlog.content[index + 1];
			editedBlog.content[index + 1] = temp;
			editedBlog.content = [...editedBlog.content];
		}
	}

	// Helper to get/set text content from blocks
	function getBlockText(block: any): string {
		// Handle direct text property (from AI generation)
		if (block.text !== undefined && typeof block.text === 'string') {
			return block.text;
		}

		// Handle items array (for lists from AI)
		if (block.items && Array.isArray(block.items)) {
			return block.items.map((item: any) => {
				if (typeof item === 'string') return item;
				if (item.text) return item.text;
				return '';
			}).join('\n');
		}

		// Handle children array (Strapi format)
		if (block.children && Array.isArray(block.children)) {
			if (block.children[0]?.text !== undefined) {
				return block.children[0].text;
			}
			if (block.children[0]?.children) {
				return block.children.map((child: any) =>
					child.children ? child.children[0]?.text || '' : child.text || ''
				).join('\n');
			}
		}

		return '';
	}

	function setBlockText(block: any, text: string) {
		if (block.type === 'list') {
			// For lists, use items array (AI format)
			block.items = text.split('\n').filter(line => line.trim()).map(line => line.trim());
			// Remove children if it exists
			delete block.children;
		} else {
			// For other blocks, use direct text property (AI format)
			block.text = text;
			// Remove children if it exists
			delete block.children;
		}
	}

	function getBlockTypeLabel(type: string): string {
		const labels: Record<string, string> = {
			'heading': 'Encabezado',
			'paragraph': 'Párrafo',
			'list': 'Lista',
			'quote': 'Cita'
		};
		return labels[type] || type;
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
				<label for="title-{language}" class="label">Título del Blog</label>
				<input
					id="title-{language}"
					type="text"
					bind:value={editedBlog.title}
					class="input"
					required
				/>
			</div>

			<div>
				<label for="slug-{language}" class="label">Slug</label>
				<input
					id="slug-{language}"
					type="text"
					bind:value={editedBlog.slug}
					class="input"
					required
				/>
			</div>
		</div>

		<div>
			<label for="excerpt-{language}" class="label">Extracto</label>
			<textarea
				id="excerpt-{language}"
				bind:value={editedBlog.excerpt}
				class="input min-h-[100px] resize-y"
				rows="3"
				placeholder="Breve resumen del artículo..."
			></textarea>
			<p class="mt-1 text-sm text-gray-500">Resumen breve que aparecerá en las vistas previas</p>
		</div>
	</div>

	<!-- Content Blocks -->
	<div class="space-y-4">
		<div class="flex items-center justify-between">
			<h4 class="font-semibold text-gray-900 text-lg">Bloques de Contenido</h4>
			<button
				type="button"
				on:click={addContentBlock}
				class="text-sm px-3 py-1 bg-emerald-100 text-emerald-700 rounded-lg hover:bg-emerald-200 transition-colors"
			>
				+ Agregar Bloque
			</button>
		</div>

		{#if editedBlog.content && editedBlog.content.length > 0}
			<div class="space-y-3">
				{#each editedBlog.content as block, index}
					<div class="p-4 bg-gray-50 rounded-lg border border-gray-200 space-y-3">
						<div class="flex items-center justify-between">
							<div class="flex items-center gap-2">
								<span class="font-semibold text-gray-700">Bloque {index + 1}</span>
								<span class="text-xs px-2 py-1 bg-gray-200 text-gray-700 rounded">
									{getBlockTypeLabel(block.type)}
								</span>
							</div>
							<div class="flex items-center gap-2">
								<button
									type="button"
									on:click={() => moveBlockUp(index)}
									disabled={index === 0}
									class="text-gray-600 hover:text-gray-800 text-sm disabled:opacity-30 disabled:cursor-not-allowed"
									title="Mover arriba"
								>
									↑
								</button>
								<button
									type="button"
									on:click={() => moveBlockDown(index)}
									disabled={index === editedBlog.content.length - 1}
									class="text-gray-600 hover:text-gray-800 text-sm disabled:opacity-30 disabled:cursor-not-allowed"
									title="Mover abajo"
								>
									↓
								</button>
								<button
									type="button"
									on:click={() => removeContentBlock(index)}
									class="text-red-600 hover:text-red-800 text-sm"
								>
									✕ Eliminar
								</button>
							</div>
						</div>

						<div class="grid md:grid-cols-2 gap-3">
							<div>
								<label class="label text-sm">Tipo de Bloque</label>
								<select
									bind:value={block.type}
									class="input"
								>
									<option value="paragraph">Párrafo</option>
									<option value="heading">Encabezado</option>
									<option value="list">Lista</option>
									<option value="quote">Cita</option>
								</select>
							</div>

							{#if block.type === 'heading'}
								<div>
									<label class="label text-sm">Nivel de Encabezado</label>
									<select
										bind:value={block.level}
										class="input"
									>
										<option value={2}>H2</option>
										<option value={3}>H3</option>
										<option value={4}>H4</option>
										<option value={5}>H5</option>
										<option value={6}>H6</option>
									</select>
								</div>
							{/if}

							{#if block.type === 'list'}
								<div>
									<label class="label text-sm">Formato de Lista</label>
									<select
										bind:value={block.style}
										class="input"
									>
										<option value="unordered">Sin ordenar (•)</option>
										<option value="ordered">Ordenada (1, 2, 3)</option>
									</select>
								</div>
							{/if}
						</div>

						<div>
							<label class="label text-sm">Contenido</label>
							<textarea
								value={getBlockText(block)}
								on:input={(e) => setBlockText(block, e.currentTarget.value)}
								class="input min-h-[100px]"
								rows="4"
								placeholder={block.type === 'list' ? 'Un elemento por línea...' : 'Escribe el contenido aquí...'}
							></textarea>
							{#if block.type === 'list'}
								<p class="mt-1 text-sm text-gray-500">Escribe cada elemento de la lista en una nueva línea</p>
							{/if}
						</div>
					</div>
				{/each}
			</div>
		{:else}
			<p class="text-gray-500 text-sm italic">No hay bloques de contenido. Haz clic en "Agregar Bloque" para añadir uno.</p>
		{/if}
	</div>

	<!-- Tags and SEO -->
	<div class="space-y-4">
		<h4 class="font-semibold text-gray-900 text-lg">Etiquetas y SEO</h4>

		<div>
			<label for="tags-{language}" class="label">Tags (separados por comas)</label>
			<input
				id="tags-{language}"
				type="text"
				bind:value={tagsText}
				class="input"
				placeholder="inmigración, visas, españa, residencia"
			/>
			<p class="mt-1 text-sm text-gray-500">Separa cada etiqueta con una coma</p>
		</div>

		{#if editedBlog.SEO}
			<div class="grid md:grid-cols-2 gap-4">
				<div>
					<label for="seo-title-{language}" class="label">SEO Título</label>
					<input
						id="seo-title-{language}"
						type="text"
						bind:value={editedBlog.SEO.metaTitle}
						class="input"
						class:border-red-500={editedBlog.SEO.metaTitle && editedBlog.SEO.metaTitle.length > 60}
					/>
					<p class="mt-1 text-sm" class:text-red-600={editedBlog.SEO.metaTitle && editedBlog.SEO.metaTitle.length > 60} class:text-gray-500={!editedBlog.SEO.metaTitle || editedBlog.SEO.metaTitle.length <= 60}>
						{editedBlog.SEO.metaTitle ? editedBlog.SEO.metaTitle.length : 0}/60 caracteres
						{#if editedBlog.SEO.metaTitle && editedBlog.SEO.metaTitle.length > 60}
							<span class="font-semibold">(¡Excede el límite!)</span>
						{/if}
					</p>
				</div>

				<div>
					<label for="seo-keywords-{language}" class="label">SEO Keywords</label>
					<input
						id="seo-keywords-{language}"
						type="text"
						bind:value={editedBlog.SEO.keywords}
						class="input"
					/>
				</div>
			</div>

			<div>
				<label for="seo-description-{language}" class="label">SEO Descripción</label>
				<textarea
					id="seo-description-{language}"
					bind:value={editedBlog.SEO.metaDescription}
					class="input min-h-[80px]"
					class:border-red-500={editedBlog.SEO.metaDescription && editedBlog.SEO.metaDescription.length > 160}
					rows="3"
				></textarea>
				<p class="mt-1 text-sm" class:text-red-600={editedBlog.SEO.metaDescription && editedBlog.SEO.metaDescription.length > 160} class:text-gray-500={!editedBlog.SEO.metaDescription || editedBlog.SEO.metaDescription.length <= 160}>
					{editedBlog.SEO.metaDescription ? editedBlog.SEO.metaDescription.length : 0}/160 caracteres
					{#if editedBlog.SEO.metaDescription && editedBlog.SEO.metaDescription.length > 160}
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
