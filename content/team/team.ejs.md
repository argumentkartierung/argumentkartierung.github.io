```{=html}
<% const current = items.filter(i => i.status !== 'former'); %>
<% const former  = items.filter(i => i.status === 'former'); %>

<% for (const [heading, list] of [['Team', current], ['Ehemalige & assoziierte Mitglieder', former]]) { %>
  <% if (list.length) { %>
    <% if (heading) { %><h2 class="team-heading"><%= heading %></h2><% } %>
<div class="team-list">
  <% for (const item of list) { %>
    <article class="team-member">
      <div class="team-member__media">
        <a class="team-member__photo-link" href="<%= item.href || '#' %>" target="_blank" rel="noopener noreferrer">
          <img class="team-member__photo" src="<%= item.thumbnail || '/content/team/images/user.png' %>" alt="<%= item.name %>" />
        </a>

        <ul class="team-member__social">
          <% for (const tile of item.social || []) { %>
            <% if (tile.website) { %>
              <li><a href="<%= tile.website %>" target="_blank" rel="noopener noreferrer" aria-label="Website"><i class="bi bi-globe"></i></a></li>
            <% } %>
            <% if (tile.github) { %>
              <li><a href="<%= tile.github %>" target="_blank" rel="noopener noreferrer" aria-label="GitHub"><i class="bi bi-github"></i></a></li>
            <% } %>
            <% if (tile.twitter) { %>
              <li><a href="<%= tile.twitter %>" target="_blank" rel="noopener noreferrer" aria-label="X / Twitter"><i class="bi bi-twitter"></i></a></li>
            <% } %>
            <% if (tile.linkedin) { %>
              <li><a href="<%= tile.linkedin %>" target="_blank" rel="noopener noreferrer" aria-label="LinkedIn"><i class="bi bi-linkedin"></i></a></li>
            <% } %>
            <% if (tile.facebook) { %>
              <li><a href="<%= tile.facebook %>" target="_blank" rel="noopener noreferrer" aria-label="Facebook"><i class="bi bi-facebook"></i></a></li>
            <% } %>
            <% if (tile.mastodon) { %>
              <li><a href="<%= tile.mastodon %>" target="_blank" rel="noopener noreferrer" aria-label="Mastodon"><i class="bi bi-mastodon"></i></a></li>
            <% } %>
          <% } %>
        </ul>
      </div>

      <div class="team-member__content">
        <h2 class="team-member__name"><%= item.name %></h2>
        <% if (item.affiliation) { %>
          <p class="team-member__affiliation"><%= item.affiliation %></p>
        <% } %>
        <% if (item.description) { %>
          <div class="team-member__description">
```
<%= item.description %>
```{=html}
          </div>
        <% } %>
      </div>
    </article>
  <% } %>
</div>
  <% } %>
<% } %>
```
