<script lang="ts">
	export let blog: any;
	export let language: 'es' | 'en';

	const languageConfig = {
		es: {
			flag: '🇪🇸',
			title: 'Spanish Version',
			bgClass: 'from-purple-50 to-pink-50',
			borderClass: 'border-purple-200',
			badgeClass: 'bg-purple-100 text-purple-800'
		},
		en: {
			flag: '🇬🇧',
			title: 'English Version',
			bgClass: 'from-cyan-50 to-blue-50',
			borderClass: 'border-cyan-200',
			badgeClass: 'bg-cyan-100 text-cyan-800'
		}
	};

	const config = languageConfig[language];
</script>

<div class="bg-gradient-to-br {config.bgClass} rounded-xl p-6 border {config.borderClass} space-y-6">
	<!-- Header -->
	<div class="flex items-center mb-4 pb-4 border-b border-gray-200">
		<span class="text-2xl mr-2">{config.flag}</span>
		<h3 class="text-xl font-bold text-gray-900">{config.title}</h3>
	</div>

	<!-- Basic Info -->
	<div class="bg-white rounded-lg p-4 space-y-3">
		<div>
			<p class="text-xs font-semibold text-gray-500 uppercase tracking-wide">Title</p>
			<h2 class="text-2xl font-bold text-gray-900 mt-1">{blog.title}</h2>
		</div>

		<div>
			<p class="text-xs font-semibold text-gray-500 uppercase tracking-wide">Slug</p>
			<code class="text-sm bg-gray-100 px-2 py-1 rounded mt-1 inline-block">{blog.slug}</code>
		</div>
	</div>

	<!-- Excerpt -->
	{#if blog.excerpt}
		<div class="bg-white rounded-lg p-4">
			<p class="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-2">Excerpt</p>
			<p class="text-sm text-gray-700 leading-relaxed italic">{blog.excerpt}</p>
		</div>
	{/if}

	<!-- Content Blocks -->
	{#if blog.content && blog.content.length > 0}
		<div class="bg-white rounded-lg p-6">
			<p class="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-4">
				Content ({blog.content.length} blocks)
			</p>
			<div class="prose prose-sm max-w-none space-y-4">
				{#each blog.content as block, index}
					{#if block.type === 'heading'}
						{#if block.level === 2}
							<h2 class="text-xl font-bold text-gray-900 mt-6 mb-3 border-b pb-2">
								{block.text}
							</h2>
						{:else if block.level === 3}
							<h3 class="text-lg font-semibold text-gray-800 mt-4 mb-2">
								{block.text}
							</h3>
						{:else}
							<h4 class="text-base font-medium text-gray-700 mt-3 mb-2">
								{block.text}
							</h4>
						{/if}
					{:else if block.type === 'paragraph'}
						<p class="text-sm text-gray-700 leading-relaxed">
							{block.text}
						</p>
					{:else if block.type === 'list'}
						{#if block.style === 'ordered'}
							<ol class="list-decimal list-inside space-y-2 ml-4">
								{#each block.items as item}
									<li class="text-sm text-gray-700">{item}</li>
								{/each}
							</ol>
						{:else}
							<ul class="list-disc list-inside space-y-2 ml-4">
								{#each block.items as item}
									<li class="text-sm text-gray-700">{item}</li>
								{/each}
							</ul>
						{/if}
					{:else if block.type === 'quote'}
						<blockquote class="border-l-4 border-primary-500 pl-4 italic text-gray-600 bg-gray-50 py-2">
							{block.text}
						</blockquote>
					{/if}
				{/each}
			</div>
		</div>
	{/if}

	<!-- Tags -->
	{#if blog.tags && blog.tags.length > 0}
		<div class="bg-white rounded-lg p-4">
			<p class="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-3">Tags</p>
			<div class="flex flex-wrap gap-2">
				{#each blog.tags as tag}
					<span class="px-3 py-1 {config.badgeClass} rounded-full text-xs font-medium">
						{tag}
					</span>
				{/each}
			</div>
		</div>
	{/if}

	<!-- SEO -->
	{#if blog.SEO}
		<details class="bg-white rounded-lg p-4">
			<summary class="cursor-pointer text-sm font-semibold text-gray-700 hover:text-primary-600">
				🔍 SEO Metadata
			</summary>
			<div class="mt-3 space-y-2 text-xs">
				<div>
					<span class="font-semibold text-gray-600">Meta Title:</span>
					<p class="text-gray-700 mt-1">{blog.SEO.metaTitle}</p>
				</div>
				<div>
					<span class="font-semibold text-gray-600">Meta Description:</span>
					<p class="text-gray-700 mt-1">{blog.SEO.metaDescription}</p>
				</div>
				{#if blog.SEO.keywords}
					<div>
						<span class="font-semibold text-gray-600">Keywords:</span>
						<p class="text-gray-700 mt-1">{blog.SEO.keywords.join(', ')}</p>
					</div>
				{/if}
				{#if blog.SEO.canonicalURL}
					<div>
						<span class="font-semibold text-gray-600">Canonical URL:</span>
						<p class="text-gray-700 mt-1">{blog.SEO.canonicalURL}</p>
					</div>
				{/if}
			</div>
		</details>
	{/if}

	<!-- Content Statistics -->
	<div class="bg-white rounded-lg p-4">
		<p class="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-3">Statistics</p>
		<div class="grid grid-cols-3 gap-4 text-center">
			<div>
				<p class="text-2xl font-bold text-primary-600">{blog.content ? blog.content.length : 0}</p>
				<p class="text-xs text-gray-600">Content Blocks</p>
			</div>
			<div>
				<p class="text-2xl font-bold text-secondary-600">{blog.tags ? blog.tags.length : 0}</p>
				<p class="text-xs text-gray-600">Tags</p>
			</div>
			<div>
				<p class="text-2xl font-bold text-green-600">
					{blog.content ? blog.content.filter(b => b.type === 'heading').length : 0}
				</p>
				<p class="text-xs text-gray-600">Headings</p>
			</div>
		</div>
	</div>

	<!-- Full JSON -->
	<details class="mt-4">
		<summary class="cursor-pointer text-sm font-semibold text-gray-700 hover:text-primary-600">
			📄 View Full JSON
		</summary>
		<pre class="mt-3 text-xs bg-gray-900 text-green-400 p-4 rounded overflow-x-auto">{JSON.stringify(blog, null, 2)}</pre>
	</details>
</div>
