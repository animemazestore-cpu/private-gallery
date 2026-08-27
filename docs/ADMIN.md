# Admin Dashboard

## Required screens

- Admin login.
- Dashboard/gallery management.
- Upload interface.
- Upload progress/error state.
- Delete confirmation.
- Logout.

## Upload behavior

- Support multiple image selection if practical.
- Validate before upload and again server-side.
- Show per-file status.
- Do not reveal server secrets.
- Store metadata in the database only after successful storage upload, or use a safe transactional/cleanup strategy.

## Delete behavior

- Confirm destructive action.
- Delete storage object.
- Delete database record.
- Handle partial failure safely and make inconsistencies recoverable.

## Optional later features

- Drag-and-drop.
- Reordering.
- Captions.
- Albums.
- Bulk delete.
- Storage usage display.
