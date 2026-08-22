---
layout: doc
title: "What Is the “Authentication Private Key” in SSH — Bastion Host SSH Auth Explained"
description: "SSH authentication private key vs user key: server identity authentication vs user authentication. How Next Terminal open source bastion host handles both layers and host fingerprint verification."
head:
  - - meta
    - name: keywords
      content: SSH authentication, SSH private key, bastion host, server identity, host fingerprint, Next Terminal, jump server
  - - meta
    - property: og:title
      content: What Is the “Authentication Private Key” in SSH?
  - - meta
    - property: og:description
      content: Clarifying server identity private key vs user authentication in SSH for bastion host access.
---

# What Is the "Authentication Private Key" in SSH, and What Does It Actually Authenticate?

Many people see an "authentication private key" in SSH-related settings and naturally assume it means the private key used by the user to log in. In most cases, that understanding is incorrect.

The key point is that SSH may involve two different kinds of private keys:

- the server's own private key
- the user's own private key

They are both called private keys, but they serve different purposes.

If the "authentication private key" in a configuration screen refers to an SSH server setting, it usually is not the user's login key. Instead, it is the **SSH server identity private key**. Its job is not to prove who the user is, but to prove who the server is.

In other words, it authenticates the server itself, not the user.

Once you understand that distinction, many common questions become easier to answer. For example:

- Why does the system still need this private key even when username/password login is enabled?
- Why does the server still need its own private key when the user logs in with SSH public key authentication?
- Why does the SSH client ask you to confirm the host fingerprint on first connection?

At their core, all of these questions are about **server identity authentication**.

When SSH establishes a connection, it does not usually begin by checking the user's password. A more typical flow is this: the client first completes the handshake with the server and verifies the server's identity; after that, the two sides establish an encrypted channel; only then does the client submit a username and password, or use the user's own SSH key to complete login authentication.

So in SSH, there are at least two distinct phases:

- First, confirm "am I connecting to the intended server?"
- Second, confirm "is this user allowed to log in to this server?"

The first depends on the **server identity private key**.
The second depends on the **user password** or the **user private key**.

That is why "authentication private key" and "username/password" are not alternatives. They address different layers.

To be more concrete: when a client connects to an SSH server, the server uses its identity private key to sign the handshake. The client then verifies that signature against the server's public key. Only after verification can the client trust that it is talking to the holder of the expected server private key.

At this stage, the server is proving its own identity.

Only after that does client-side user authentication proceed — submitting username/password or signing a challenge with the user's private key for public-key authentication.

Therefore:

- **Server identity private key** answers "which server is this?"
- **User password / user SSH private key** answers "which user is this?"

They sound similar but have entirely different responsibilities.

This also explains a common misconception: some people think "since I already use password login, the server private key is no longer needed." In fact, even with password login, the server must first prove its identity. Otherwise, the client cannot reliably confirm it is connected to the intended server.

When connecting to an SSH server for the first time, the client often prompts to confirm the host fingerprint for this very reason. At first connection, the client can verify "the peer holds some private key," but it does not yet know whether that key belongs to the intended server. User confirmation is required. After that, the client records the server public key and uses it to detect future host identity changes.

If the client later warns that the host fingerprint has changed, it usually means one of:

- Server reinstalled or regenerated host keys
- Connection is not to the original server
- Potential man-in-the-middle risk

This is why the server identity private key must not be replaced casually or leaked.

If the user authenticates with an SSH public key rather than a password, the picture is similar. The difference is that during user authentication, the user signs challenge data with their own private key and the server verifies it with the registered public key.

But in either case, the earlier server identity authentication step still exists. In other words:

- User password can be replaced by a user private key
- But the server identity private key cannot be removed

In a product configuration UI, a more accurate label than just "authentication private key" would be:

**SSH server identity private key**

It is less likely to be misread as a user login key.

So the takeaway can be summarized in one sentence:

**If the "authentication private key" in SSH is a server-side setting, it typically authenticates the server, not the user.**

Who the user is is proven by username/password or the user's own SSH private key. Who the server is is proven by the server's own identity private key.

> In an **open source bastion host** like Next Terminal, this separation is reflected in asset credential management and host fingerprint handling. See [Asset Management](/usage/asset), [Asset Access](/usage/access), and [Termark native client](/usage/termark) for direct access to authorized SSH assets.
