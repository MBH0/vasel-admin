<script lang="ts">
	import PageHeader from '$lib/components/PageHeader.svelte';
	import LoadingSpinner from '$lib/components/LoadingSpinner.svelte';
	import Alert from '$lib/components/Alert.svelte';
	import ServicePreview from '$lib/components/ServicePreview.svelte';
	import ServiceEditor from '$lib/components/ServiceEditor.svelte';
	import { headersWithCSRF } from '$lib/csrf';
	import { handleSessionExpiration, updateCSRFToken } from '$lib/sessionHelper';

	let serviceName = '';
	let keywords = '';
	let complexity: 'Básico' | 'Intermedio' | 'Avanzado' = 'Intermedio';
	let priceRange = '€800 - €1,500';
	let duration = '4-8 months';
	let comments = '';

	let loading = false;
	let error = '';
	let success = '';
	let generatedContent: any = null;
	let editModeEs = false;
	let editModeEn = false;

	async function generateService() {
		if (!serviceName.trim()) {
			error = 'Please provide a service name';
			return;
		}

		loading = true;
		error = '';
		success = '';
		generatedContent = null;

		try {
			const response = await fetch('/api/generate-service', {
				method: 'POST',
				headers: headersWithCSRF(),
				body: JSON.stringify({
					serviceName,
					keywords: keywords.split(',').map((k) => k.trim()).filter((k) => k),
					complexity,
					priceRange,
					duration,
					comments: comments.trim() || undefined
				})
			});

			const data = await response.json();

			// Check for session expiration
			if (response.status === 401 || response.headers.get('X-Session-Expired') === 'true') {
				await handleSessionExpiration(data.error || 'Your session has expired. Please log in again.');
				return;
			}

			// Update CSRF token if provided in response
			updateCSRFToken(data);

			if (!response.ok) {
				throw new Error(data.error || 'Failed to generate service');
			}

			generatedContent = data;
			success = 'Service generated successfully! Review and publish below.';
		} catch (err: any) {
			error = err.message || 'An error occurred while generating the service';
		} finally {
			loading = false;
		}
	}

	async function publishToStrapi() {
		if (!generatedContent) return;

		loading = true;
		error = '';

		try {
			const response = await fetch('/api/publish-service', {
				method: 'POST',
				headers: headersWithCSRF(),
				body: JSON.stringify(generatedContent)
			});

			const data = await response.json();

			// Check for session expiration
			if (response.status === 401 || response.headers.get('X-Session-Expired') === 'true') {
				await handleSessionExpiration(data.error || 'Your session has expired. Please log in again.');
				return;
			}

			// Update CSRF token if provided in response
			updateCSRFToken(data);

			if (!response.ok) {
				throw new Error(data.error || 'Failed to publish service');
			}

			success = '✅ Service published to Strapi successfully!';
			serviceName = '';
			keywords = '';
			complexity = 'Intermedio';
			priceRange = '€800 - €1,500';
			duration = '4-8 months';
			comments = '';
			generatedContent = null;
			editModeEs = false;
			editModeEn = false;
		} catch (err: any) {
			error = err.message || 'An error occurred while publishing';
		} finally {
			loading = false;
		}
	}

	function handleSaveEs(updatedService: any) {
		generatedContent.es = updatedService;
		editModeEs = false;
		generatedContent = generatedContent; // Trigger reactivity
	}

	function handleSaveEn(updatedService: any) {
		generatedContent.en = updatedService;
		editModeEn = false;
		generatedContent = generatedContent; // Trigger reactivity
	}

	function handleCancelEs() {
		editModeEs = false;
	}

	function handleCancelEn() {
		editModeEn = false;
	}
</script>

<svelte:head>
	<title>Generate Service - Vasel Admin</title>
</svelte:head>

<div class="py-8 px-4 sm:px-6 lg:px-8">
	<div class="max-w-5xl mx-auto">
		<PageHeader
			title="Generate Service"
			description="Create comprehensive immigration service content using AI"
			icon="📋"
		/>

		<div class="card p-8 mb-8">
			<form on:submit|preventDefault={generateService} class="space-y-6">
				<div>
					<label for="serviceName" class="label">
						Service Name <span class="text-red-500">*</span>
					</label>
					<input
						id="serviceName"
						type="text"
						bind:value={serviceName}
						placeholder="e.g., Permiso de Residencia por Trabajo"
						class="input"
						required
					/>
					<p class="mt-1 text-sm text-gray-500">
						Enter the name of the immigration service in Spanish
					</p>
				</div>

				<div>
					<label for="keywords" class="label">Keywords (Optional)</label>
					<input
						id="keywords"
						type="text"
						bind:value={keywords}
						placeholder="e.g., trabajo, residencia, ley 14, permiso laboral"
						class="input"
					/>
					<p class="mt-1 text-sm text-gray-500">
						Comma-separated keywords for SEO optimization
					</p>
				</div>

				<div class="grid md:grid-cols-3 gap-6">
					<div>
						<label for="complexity" class="label">Complexity</label>
						<select id="complexity" bind:value={complexity} class="input">
							<option value="Básico">Básico</option>
							<option value="Intermedio">Intermedio</option>
							<option value="Avanzado">Avanzado</option>
						</select>
					</div>

					<div>
						<label for="priceRange" class="label">Price Range</label>
						<input id="priceRange" type="text" bind:value={priceRange} class="input" />
					</div>

					<div>
						<label for="duration" class="label">Duration</label>
						<input id="duration" type="text" bind:value={duration} class="input" />
					</div>
				</div>

				<div>
					<label for="comments" class="label">
						Additional Comments (Optional)
					</label>
					<textarea
						id="comments"
						bind:value={comments}
						placeholder="Provide any additional context or specific requirements for the AI to consider..."
						class="input min-h-[120px] resize-y"
						rows="4"
					></textarea>
					<p class="mt-1 text-sm text-gray-500">
						Any special requirements, target audience details, or specific information you want the AI to include
					</p>
				</div>

				{#if error}
					<Alert type="error" message={error} />
				{/if}

				{#if success && !generatedContent}
					<Alert type="success" message={success} />
				{/if}

				<button type="submit" disabled={loading} class="btn-primary w-full">
					{#if loading}
						<svg
							class="animate-spin h-5 w-5 inline-block mr-2"
							fill="none"
							viewBox="0 0 24 24"
						>
							<circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
							<path
								class="opacity-75"
								fill="currentColor"
								d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
							></path>
						</svg>
						Generating...
					{:else}
						✨ Generate with AI
					{/if}
				</button>
			</form>
		</div>

		{#if loading && !generatedContent}
			<div class="card p-8">
				<LoadingSpinner message="AI is creating your service content..." />
			</div>
		{/if}

		{#if generatedContent}
			<div class="space-y-6 animate-slide-up">
				<div class="card p-8">
					<div class="flex items-center justify-between mb-6">
						<h2 class="text-2xl font-bold text-gray-900">
							{#if editModeEs || editModeEn}
								✏️ Editando Contenido
							{:else}
								✨ Generated Content Preview
							{/if}
						</h2>
						<div class="flex items-center gap-3">
							{#if !editModeEs && !editModeEn}
								<button
									type="button"
									on:click={() => { editModeEs = true; editModeEn = true; }}
									class="px-4 py-2 bg-blue-100 text-blue-700 rounded-lg hover:bg-blue-200 transition-colors text-sm font-semibold"
								>
									✏️ Editar Ambas
								</button>
							{/if}
							<span class="px-4 py-2 bg-emerald-100 text-emerald-800 rounded-full text-sm font-semibold">
								Ready to Publish
							</span>
						</div>
					</div>

					<div class="grid lg:grid-cols-2 gap-6">
						<!-- Spanish Version -->
						<div class="space-y-3">
							{#if !editModeEs}
								<div class="flex justify-end">
									<button
										type="button"
										on:click={() => editModeEs = true}
										class="text-sm px-3 py-1 bg-blue-100 text-blue-700 rounded-lg hover:bg-blue-200 transition-colors"
									>
										✏️ Editar Español
									</button>
								</div>
								<ServicePreview service={generatedContent.es} language="es" />
							{:else}
								<ServiceEditor
									service={generatedContent.es}
									language="es"
									onSave={handleSaveEs}
									onCancel={handleCancelEs}
								/>
							{/if}
						</div>

						<!-- English Version -->
						<div class="space-y-3">
							{#if !editModeEn}
								<div class="flex justify-end">
									<button
										type="button"
										on:click={() => editModeEn = true}
										class="text-sm px-3 py-1 bg-blue-100 text-blue-700 rounded-lg hover:bg-blue-200 transition-colors"
									>
										✏️ Editar Inglés
									</button>
								</div>
								<ServicePreview service={generatedContent.en} language="en" />
							{:else}
								<ServiceEditor
									service={generatedContent.en}
									language="en"
									onSave={handleSaveEn}
									onCancel={handleCancelEn}
								/>
							{/if}
						</div>
					</div>

					{#if success}
						<div class="mt-6">
							<Alert type="success" message={success} />
						</div>
					{/if}

					<button on:click={publishToStrapi} disabled={loading} class="btn-success w-full mt-6">
						{#if loading}
							<svg
								class="animate-spin h-5 h-5 inline-block mr-2"
								fill="none"
								viewBox="0 0 24 24"
							>
								<circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
								<path
									class="opacity-75"
									fill="currentColor"
									d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
								></path>
							</svg>
							Publishing...
						{:else}
							🚀 Publish to Strapi
						{/if}
					</button>
				</div>
			</div>
		{/if}
	</div>
</div>
