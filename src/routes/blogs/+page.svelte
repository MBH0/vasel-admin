<script lang="ts">
	import PageHeader from '$lib/components/PageHeader.svelte';
	import LoadingSpinner from '$lib/components/LoadingSpinner.svelte';
	import Alert from '$lib/components/Alert.svelte';
	import BlogPreview from '$lib/components/BlogPreview.svelte';
	import BlogEditor from '$lib/components/BlogEditor.svelte';
	import { headersWithCSRF } from '$lib/csrf';
	import { handleSessionExpiration, updateCSRFToken } from '$lib/sessionHelper';

	// Mode selection
	let mode: 'ai' | 'json' = 'ai';

	// AI Generation fields
	let topic = '';
	let keywords = '';
	let targetAudience = 'Foreigners seeking to immigrate to Spain';
	let comments = '';

	// JSON Import fields
	let jsonInput = '';

	let loading = false;
	let error = '';
	let success = '';
	let generatedContent: any = null;
	let editModeEs = false;
	let editModeEn = false;

	async function generateBlog() {
		if (!topic.trim()) {
			error = 'Please provide a blog topic';
			return;
		}

		loading = true;
		error = '';
		success = '';
		generatedContent = null;

		try {
			const response = await fetch('/api/generate-blog', {
				method: 'POST',
				headers: headersWithCSRF(),
				body: JSON.stringify({
					topic,
					keywords: keywords.split(',').map(k => k.trim()).filter(k => k),
					targetAudience,
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
				throw new Error(data.error || 'Failed to generate blog');
			}

			generatedContent = data;
			success = 'Blog generated successfully! Review and publish below.';
		} catch (err: any) {
			error = err.message || 'An error occurred while generating the blog';
		} finally {
			loading = false;
		}
	}

	function importFromJSON() {
		if (!jsonInput.trim()) {
			error = 'Please provide JSON content';
			return;
		}

		loading = true;
		error = '';
		success = '';
		generatedContent = null;

		try {
			// Parse the JSON
			const parsed = JSON.parse(jsonInput);

			// Validate structure
			if (!parsed.es || !parsed.en) {
				throw new Error('JSON must contain both "es" and "en" objects');
			}

			// Validate Spanish version
			if (!parsed.es.title || !parsed.es.slug || !parsed.es.content) {
				throw new Error('Spanish version missing required fields: title, slug, or content');
			}

			// Validate English version
			if (!parsed.en.title || !parsed.en.slug || !parsed.en.content) {
				throw new Error('English version missing required fields: title, slug, or content');
			}

			// Normalize and set the content
			generatedContent = {
				es: {
					...parsed.es,
					tags: Array.isArray(parsed.es.tags) ? parsed.es.tags : [],
					SEO: parsed.es.SEO || parsed.es.seo || {}
				},
				en: {
					...parsed.en,
					tags: Array.isArray(parsed.en.tags) ? parsed.en.tags : [],
					SEO: parsed.en.SEO || parsed.en.seo || {}
				}
			};

			success = 'JSON imported successfully! Review and publish below.';
		} catch (err: any) {
			if (err instanceof SyntaxError) {
				error = 'Invalid JSON format. Please check your JSON syntax.';
			} else {
				error = err.message || 'An error occurred while importing JSON';
			}
		} finally {
			loading = false;
		}
	}

	async function publishToStrapi() {
		if (!generatedContent) return;

		loading = true;
		error = '';

		try {
			const response = await fetch('/api/publish-blog', {
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
				throw new Error(data.error || 'Failed to publish blog');
			}

			success = '✅ Blog published to Strapi successfully!';
			// Reset form
			topic = '';
			keywords = '';
			targetAudience = 'Foreigners seeking to immigrate to Spain';
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

	function handleSaveEs(updatedBlog: any) {
		generatedContent.es = updatedBlog;
		editModeEs = false;
		generatedContent = generatedContent; // Trigger reactivity
	}

	function handleSaveEn(updatedBlog: any) {
		generatedContent.en = updatedBlog;
		editModeEn = false;
		generatedContent = generatedContent; // Trigger reactivity
	}

	function handleCancelEs() {
		editModeEs = false;
	}

	function handleCancelEn() {
		editModeEn = false;
	}

	// Copy JSON functions
	async function copyToClipboard(text: string, locale: string) {
		try {
			await navigator.clipboard.writeText(text);
			success = `✅ ${locale} JSON copied to clipboard!`;
			setTimeout(() => {
				if (success.includes('copied to clipboard')) success = '';
			}, 3000);
		} catch (err) {
			error = 'Failed to copy to clipboard';
		}
	}

	function copyEsJson() {
		if (!generatedContent?.es) return;
		const json = JSON.stringify(generatedContent.es, null, 2);
		copyToClipboard(json, 'Spanish');
	}

	function copyEnJson() {
		if (!generatedContent?.en) return;
		const json = JSON.stringify(generatedContent.en, null, 2);
		copyToClipboard(json, 'English');
	}

	function copyBothJson() {
		if (!generatedContent) return;
		const json = JSON.stringify(generatedContent, null, 2);
		copyToClipboard(json, 'Both');
	}
</script>

<svelte:head>
	<title>Generate Blog - Vasel Admin</title>
</svelte:head>

<div class="py-8 px-4 sm:px-6 lg:px-8">
	<div class="max-w-5xl mx-auto">
		<PageHeader
			title="Generate Blog"
			description="Create comprehensive immigration blog content using AI or import from JSON"
			icon="✍️"
		/>

		<!-- Mode Selection Tabs -->
		<div class="card p-6 mb-8">
			<div class="flex gap-2 border-b border-gray-200">
				<button
					type="button"
					on:click={() => { mode = 'ai'; error = ''; success = ''; }}
					class="px-6 py-3 font-semibold border-b-2 transition-colors {mode === 'ai' ? 'border-primary text-primary' : 'border-transparent text-gray-500 hover:text-gray-700'}"
				>
					🤖 Generate with AI
				</button>
				<button
					type="button"
					on:click={() => { mode = 'json'; error = ''; success = ''; }}
					class="px-6 py-3 font-semibold border-b-2 transition-colors {mode === 'json' ? 'border-primary text-primary' : 'border-transparent text-gray-500 hover:text-gray-700'}"
				>
					📋 Import from JSON
				</button>
			</div>
		</div>

		{#if mode === 'ai'}
		<div class="card p-8 mb-8">
			<form on:submit|preventDefault={generateBlog} class="space-y-6">
				<div>
					<label for="topic" class="label">
						Blog Topic <span class="text-red-500">*</span>
					</label>
					<input
						id="topic"
						type="text"
						bind:value={topic}
						placeholder="e.g., Cómo obtener la nacionalidad española"
						class="input"
						required
					/>
					<p class="mt-1 text-sm text-gray-500">
						What should this blog article be about?
					</p>
				</div>

				<div>
					<label for="keywords" class="label">Keywords (Optional)</label>
					<input
						id="keywords"
						type="text"
						bind:value={keywords}
						placeholder="e.g., nacionalidad, residencia, documentos, requisitos"
						class="input"
					/>
					<p class="mt-1 text-sm text-gray-500">
						Comma-separated keywords for SEO optimization
					</p>
				</div>

				<div>
					<label for="targetAudience" class="label">Target Audience (Optional)</label>
					<input
						id="targetAudience"
						type="text"
						bind:value={targetAudience}
						placeholder="Foreigners seeking to immigrate to Spain"
						class="input"
					/>
					<p class="mt-1 text-sm text-gray-500">
						Who is this blog post written for?
					</p>
				</div>

				<div>
					<label for="comments" class="label">
						Additional Comments (Optional)
					</label>
					<textarea
						id="comments"
						bind:value={comments}
						placeholder="Provide any additional context, specific points to cover, or requirements for the AI to consider..."
						class="input min-h-[120px] resize-y"
						rows="4"
					></textarea>
					<p class="mt-1 text-sm text-gray-500">
						Any special requirements or specific information you want the AI to include
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
		{:else}
		<!-- JSON Import Mode -->
		<div class="card p-8 mb-8">
			<form on:submit|preventDefault={importFromJSON} class="space-y-6">
				<div>
					<label for="jsonInput" class="label">
						Blog JSON <span class="text-red-500">*</span>
					</label>
					<textarea
						id="jsonInput"
						bind:value={jsonInput}
						placeholder="Paste your complete blog JSON here with both 'es' and 'en' versions..."
						class="input font-mono text-sm min-h-[400px] resize-y"
						rows="20"
						required
					></textarea>
					<p class="mt-1 text-sm text-gray-500">
						Paste the complete blog JSON with both Spanish (es) and English (en) versions
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
						Processing...
					{:else}
						📥 Import JSON
					{/if}
				</button>
			</form>
		</div>
		{/if}

		{#if loading && !generatedContent}
			<div class="card p-8">
				<LoadingSpinner message={mode === 'ai' ? "AI is creating your blog content..." : "Processing your JSON..."} />
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
						<div class="flex items-center gap-3 flex-wrap">
							{#if !editModeEs && !editModeEn}
								<button
									type="button"
									on:click={() => { editModeEs = true; editModeEn = true; }}
									class="px-4 py-2 bg-blue-100 text-blue-700 rounded-lg hover:bg-blue-200 transition-colors text-sm font-semibold"
								>
									✏️ Editar Ambas
								</button>
								<button
									type="button"
									on:click={copyBothJson}
									class="px-4 py-2 bg-purple-100 text-purple-700 rounded-lg hover:bg-purple-200 transition-colors text-sm font-semibold"
									title="Copy both ES and EN JSON"
								>
									📋 Copy Both JSON
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
								<div class="flex justify-end gap-2">
									<button
										type="button"
										on:click={copyEsJson}
										class="text-sm px-3 py-1 bg-purple-100 text-purple-700 rounded-lg hover:bg-purple-200 transition-colors"
										title="Copy Spanish JSON"
									>
										📋 Copy ES
									</button>
									<button
										type="button"
										on:click={() => editModeEs = true}
										class="text-sm px-3 py-1 bg-blue-100 text-blue-700 rounded-lg hover:bg-blue-200 transition-colors"
									>
										✏️ Editar Español
									</button>
								</div>
								<BlogPreview blog={generatedContent.es} language="es" />
							{:else}
								<BlogEditor
									blog={generatedContent.es}
									language="es"
									onSave={handleSaveEs}
									onCancel={handleCancelEs}
								/>
							{/if}
						</div>

						<!-- English Version -->
						<div class="space-y-3">
							{#if !editModeEn}
								<div class="flex justify-end gap-2">
									<button
										type="button"
										on:click={copyEnJson}
										class="text-sm px-3 py-1 bg-purple-100 text-purple-700 rounded-lg hover:bg-purple-200 transition-colors"
										title="Copy English JSON"
									>
										📋 Copy EN
									</button>
									<button
										type="button"
										on:click={() => editModeEn = true}
										class="text-sm px-3 py-1 bg-blue-100 text-blue-700 rounded-lg hover:bg-blue-200 transition-colors"
									>
										✏️ Editar Inglés
									</button>
								</div>
								<BlogPreview blog={generatedContent.en} language="en" />
							{:else}
								<BlogEditor
									blog={generatedContent.en}
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
