<script lang="ts">
	let title = 'Vasel Admin - AI Content Generator';
</script>

<svelte:head>
	<title>{title}</title>
</svelte:head>

<div class="py-12 px-4 sm:px-6 lg:px-8">
	<div class="max-w-7xl mx-auto">
		<!-- Header Section -->
		<div class="text-center mb-16 animate-slide-down">
			<h1 class="text-5xl font-extrabold text-gray-900 mb-4">
				<span
					class="bg-gradient-to-r from-primary-600 via-purple-600 to-secondary-600 bg-clip-text text-transparent"
				>
					Content Generator
				</span>
			</h1>
			<p class="text-xl text-gray-600 max-w-2xl mx-auto">
				Create professional immigration law content in Spanish and English using advanced AI
			</p>
		</div>

		<!-- Stats Cards -->
		<div class="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12 animate-slide-up">
			<div class="card p-6">
				<div class="flex items-center justify-between">
					<div>
						<p class="text-sm font-medium text-gray-600">AI Model</p>
						<p class="text-2xl font-bold text-gray-900 mt-1">GPT-4o</p>
					</div>
					<div
						class="w-12 h-12 bg-gradient-to-br from-blue-500 to-cyan-500 rounded-xl flex items-center justify-center text-2xl shadow-lg"
					>
						🤖
					</div>
				</div>
			</div>

			<div class="card p-6">
				<div class="flex items-center justify-between">
					<div>
						<p class="text-sm font-medium text-gray-600">Languages</p>
						<p class="text-2xl font-bold text-gray-900 mt-1">ES + EN</p>
					</div>
					<div
						class="w-12 h-12 bg-gradient-to-br from-emerald-500 to-teal-500 rounded-xl flex items-center justify-center text-2xl shadow-lg"
					>
						🌍
					</div>
				</div>
			</div>

			<div class="card p-6">
				<div class="flex items-center justify-between">
					<div>
						<p class="text-sm font-medium text-gray-600">Status</p>
						<p class="text-2xl font-bold text-emerald-600 mt-1">Ready</p>
					</div>
					<div
						class="w-12 h-12 bg-gradient-to-br from-purple-500 to-pink-500 rounded-xl flex items-center justify-center text-2xl shadow-lg"
					>
						✨
					</div>
				</div>
			</div>
		</div>

		<!-- Main Action Cards -->
		<div class="grid grid-cols-1 md:grid-cols-2 gap-8 mb-12">
			<!-- Services Card -->
			<a
				href="/services"
				class="group card p-8 hover:scale-[1.02] transition-transform duration-300"
			>
				<div class="flex items-start justify-between mb-6">
					<div
						class="w-16 h-16 bg-gradient-to-br from-primary-500 to-secondary-500 rounded-2xl flex items-center justify-center text-3xl shadow-xl group-hover:shadow-2xl transition-shadow"
					>
						📋
					</div>
					<div
						class="px-3 py-1 bg-primary-50 text-primary-700 text-xs font-semibold rounded-full"
					>
						Popular
					</div>
				</div>

				<h2
					class="text-2xl font-bold text-gray-900 mb-3 group-hover:text-primary-600 transition-colors"
				>
					Generate Services
				</h2>

				<p class="text-gray-600 mb-6 leading-relaxed">
					Create comprehensive immigration service descriptions with AI. Includes benefits,
					process steps, FAQs, and complete SEO metadata.
				</p>

				<div class="space-y-2 mb-6">
					<div class="flex items-center text-sm text-gray-700">
						<svg
							class="w-5 h-5 text-emerald-500 mr-2"
							fill="currentColor"
							viewBox="0 0 20 20"
						>
							<path
								fill-rule="evenodd"
								d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
								clip-rule="evenodd"
							/>
						</svg>
						Bilingual content (ES + EN)
					</div>
					<div class="flex items-center text-sm text-gray-700">
						<svg
							class="w-5 h-5 text-emerald-500 mr-2"
							fill="currentColor"
							viewBox="0 0 20 20"
						>
							<path
								fill-rule="evenodd"
								d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
								clip-rule="evenodd"
							/>
						</svg>
						SEO optimized
					</div>
					<div class="flex items-center text-sm text-gray-700">
						<svg
							class="w-5 h-5 text-emerald-500 mr-2"
							fill="currentColor"
							viewBox="0 0 20 20"
						>
							<path
								fill-rule="evenodd"
								d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
								clip-rule="evenodd"
							/>
						</svg>
						Structured data included
					</div>
				</div>

				<div
					class="flex items-center text-primary-600 font-semibold group-hover:translate-x-2 transition-transform"
				>
					Start generating
					<svg class="w-5 h-5 ml-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
						<path
							stroke-linecap="round"
							stroke-linejoin="round"
							stroke-width="2"
							d="M17 8l4 4m0 0l-4 4m4-4H3"
						/>
					</svg>
				</div>
			</a>

			<!-- Blogs Card -->
			<a
				href="/blogs"
				class="group card p-8 hover:scale-[1.02] transition-transform duration-300"
			>
				<div class="flex items-start justify-between mb-6">
					<div
						class="w-16 h-16 bg-gradient-to-br from-emerald-500 to-teal-500 rounded-2xl flex items-center justify-center text-3xl shadow-xl group-hover:shadow-2xl transition-shadow"
					>
						✍️
					</div>
					<div class="px-3 py-1 bg-emerald-50 text-emerald-700 text-xs font-semibold rounded-full">
						New
					</div>
				</div>

				<h2
					class="text-2xl font-bold text-gray-900 mb-3 group-hover:text-emerald-600 transition-colors"
				>
					Generate Blogs
				</h2>

				<p class="text-gray-600 mb-6 leading-relaxed">
					Create informative and engaging blog articles about immigration topics. AI generates
					structured content with headings, lists, and proper formatting.
				</p>

				<div class="space-y-2 mb-6">
					<div class="flex items-center text-sm text-gray-700">
						<svg
							class="w-5 h-5 text-emerald-500 mr-2"
							fill="currentColor"
							viewBox="0 0 20 20"
						>
							<path
								fill-rule="evenodd"
								d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
								clip-rule="evenodd"
							/>
						</svg>
						Rich content blocks
					</div>
					<div class="flex items-center text-sm text-gray-700">
						<svg
							class="w-5 h-5 text-emerald-500 mr-2"
							fill="currentColor"
							viewBox="0 0 20 20"
						>
							<path
								fill-rule="evenodd"
								d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
								clip-rule="evenodd"
							/>
						</svg>
						Expert legal content
					</div>
					<div class="flex items-center text-sm text-gray-700">
						<svg
							class="w-5 h-5 text-emerald-500 mr-2"
							fill="currentColor"
							viewBox="0 0 20 20"
						>
							<path
								fill-rule="evenodd"
								d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
								clip-rule="evenodd"
							/>
						</svg>
						Keyword optimized
					</div>
				</div>

				<div
					class="flex items-center text-emerald-600 font-semibold group-hover:translate-x-2 transition-transform"
				>
					Start writing
					<svg class="w-5 h-5 ml-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
						<path
							stroke-linecap="round"
							stroke-linejoin="round"
							stroke-width="2"
							d="M17 8l4 4m0 0l-4 4m4-4H3"
						/>
					</svg>
				</div>
			</a>
		</div>

		<!-- Info Section -->
		<div class="card p-8">
			<div class="flex items-start space-x-4">
				<div
					class="flex-shrink-0 w-12 h-12 bg-blue-100 rounded-xl flex items-center justify-center"
				>
					<svg class="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
						<path
							stroke-linecap="round"
							stroke-linejoin="round"
							stroke-width="2"
							d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
						/>
					</svg>
				</div>

				<div class="flex-1">
					<h3 class="text-lg font-bold text-gray-900 mb-3">How it works</h3>

					<div class="grid md:grid-cols-4 gap-6">
						<div>
							<div
								class="inline-flex items-center justify-center w-8 h-8 bg-primary-100 text-primary-700 rounded-full font-bold mb-3"
							>
								1
							</div>
							<h4 class="font-semibold text-gray-900 mb-1">Choose Type</h4>
							<p class="text-sm text-gray-600">Select service or blog content</p>
						</div>

						<div>
							<div
								class="inline-flex items-center justify-center w-8 h-8 bg-primary-100 text-primary-700 rounded-full font-bold mb-3"
							>
								2
							</div>
							<h4 class="font-semibold text-gray-900 mb-1">Provide Details</h4>
							<p class="text-sm text-gray-600">Add topic, keywords, and requirements</p>
						</div>

						<div>
							<div
								class="inline-flex items-center justify-center w-8 h-8 bg-primary-100 text-primary-700 rounded-full font-bold mb-3"
							>
								3
							</div>
							<h4 class="font-semibold text-gray-900 mb-1">AI Generation</h4>
							<p class="text-sm text-gray-600">GPT-4o creates complete content</p>
						</div>

						<div>
							<div
								class="inline-flex items-center justify-center w-8 h-8 bg-primary-100 text-primary-700 rounded-full font-bold mb-3"
							>
								4
							</div>
							<h4 class="font-semibold text-gray-900 mb-1">Publish</h4>
							<p class="text-sm text-gray-600">Review and publish to Strapi</p>
						</div>
					</div>
				</div>
			</div>
		</div>
	</div>
</div>
