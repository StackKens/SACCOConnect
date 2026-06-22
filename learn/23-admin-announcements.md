# app/(admin)/announcements.tsx — Post Announcements

## What This Screen Does

Admin composes a title + content, posts it to the backend, and sees a live list of all past announcements with delete capability.

---

## Key Patterns

### fetchAnnouncements as a Named Callback

```tsx
const fetchAnnouncements = useCallback(() => {
  let active = true;
  api.get("/api/announcements")
    .then((res) => { if (active) setAnnouncements(res.data.data); })
    .finally(() => { if (active) setLoading(false); });
  return () => { active = false; };
}, []);

useFocusEffect(fetchAnnouncements);
```

Named so it can be called again after posting — `fetchAnnouncements()` at the end of `handlePost` refreshes the list immediately.

---

### Optimistic Delete

```tsx
await api.delete(`/api/announcements/${id}`);
setAnnouncements((prev) => prev.filter((a) => a.id !== id));
```

After the API delete succeeds, the local list is updated by filtering out the deleted item. No re-fetch needed. This is the correct pattern for delete — remove from local state immediately after server confirms.

---

### Post and Refresh

```tsx
await api.post("/api/announcements", { title, message, author });
setTitle("");
setContent("");
fetchAnnouncements();  // refresh the list
```

After posting, clear the form and refresh the list. Simple, no state management library needed for this flow.

---

## Best Practices

✅ Named callback reused for post-action refresh  
✅ Filter-based local delete after server confirm  
✅ Form cleared after successful post
