<script lang="ts">
	// Placeholder for content management page
	let title = 'Manage Content - Coming Soon';
</script>

<svelte:head>
	<title>{title}</title>
</svelte:head>

<div class="container">
	<header>
		<a href="/" class="back">← Back to Dashboard</a>
		<h1>⚙️ Manage Content</h1>
		<p>View and edit existing services and blogs</p>
	</header>

	<div class="content">
		<div class="coming-soon">
			<div class="icon">🚧</div>
			<h2>Coming Soon</h2>
			<p>This feature is currently under development.</p>
			<p>For now, you can manage content directly in the Strapi admin panel:</p>
			<a href="http://localhost:1337/admin" target="_blank" class="btn-link">
				Open Strapi Admin →
			</a>
		</div>
	</div>
</div>

<style>
	.container {
		max-width: 1000px;
		margin: 0 auto;
		padding: 2rem;
	}

	header {
		margin-bottom: 2rem;
	}

	.back {
		display: inline-block;
		color: #667eea;
		text-decoration: none;
		margin-bottom: 1rem;
		font-weight: 500;
	}

	.back:hover {
		text-decoration: underline;
	}

	h1 {
		margin: 0 0 0.5rem 0;
		color: #333;
	}

	header p {
		color: #666;
		margin: 0;
	}

	.content {
		background: white;
		border-radius: 12px;
		padding: 3rem;
		box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
	}

	.coming-soon {
		text-align: center;
		padding: 2rem;
	}

	.icon {
		font-size: 4rem;
		margin-bottom: 1rem;
	}

	.coming-soon h2 {
		margin: 0 0 1rem 0;
		color: #333;
	}

	.coming-soon p {
		color: #666;
		line-height: 1.6;
		margin: 0.5rem 0;
	}

	.btn-link {
		display: inline-block;
		margin-top: 2rem;
		padding: 1rem 2rem;
		background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
		color: white;
		text-decoration: none;
		border-radius: 6px;
		font-weight: 600;
		transition: transform 0.2s;
	}

	.btn-link:hover {
		transform: translateY(-2px);
	}
</style>
