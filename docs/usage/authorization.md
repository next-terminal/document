---
layout: doc
title: "Resource Authorization and Access Strategies — Next Terminal"
description: "Assign Next Terminal assets to users or departments and control file, clipboard and session operations with access strategies."
---

# Resource Authorization and Access Strategies

Creating an asset does not automatically grant normal users access. Resource Authorization defines who can access which assets, for how long, and with which operations.

## Authorization targets

An authorization can combine departments, users, asset groups and individual assets. Group authorization is useful for a stable business scope; individual selection provides precise control.

## Create an authorization

1. Open **Resource Authorization > Asset Authorization**.
2. Select departments or users.
3. Select asset groups or assets.
4. On premium editions, optionally attach a command filter and access strategy.
5. Choose no expiration or a specific expiration time.
6. Save and verify with the target user.

<!-- TODO(image): Add the asset-authorization form and result list. -->

## Access strategies

Strategies control upload, download, directory/file creation, edit, delete, rename, copy and paste. Disabled actions normally disappear from the interface. Apply least privilege—for example, a user who only retrieves logs may need download but not upload, edit or delete.

<!-- TODO(image): Add the access-strategy form. -->

## Verification

With the target user's account, confirm that the asset appears, a session opens, file and clipboard tools match the strategy, and session/command/file actions reach audit logs.

## Troubleshooting

- **Administrator connects but the user cannot see the asset:** verify user/department, asset/group and expiration.
- **Connection works but upload or clipboard does not:** verify the attached strategy.
- **A new group member is absent:** verify whether the authorization targets the group or only assets selected at creation time.
