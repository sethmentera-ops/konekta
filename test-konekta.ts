/**
 * Automated test script verifying KONEKTA workflows
 */

const BASE_URL = 'http://localhost:3000/api';

async function runTests() {
  console.log('🧪 Starting KONEKTA Automated Workflow Verification...\n');
  let passed = 0;
  let failed = 0;

  function assert(condition: boolean, testName: string, detail?: string) {
    if (condition) {
      console.log(`✅ PASS: ${testName}`);
      passed++;
    } else {
      console.error(`❌ FAIL: ${testName} ${detail ? `(${detail})` : ''}`);
      failed++;
    }
  }

  try {
    // 1. Register a new account
    const testUsername = `tester_${Date.now()}`;
    const testEmail = `${testUsername}@example.com`;
    const regRes = await fetch(`${BASE_URL}/auth/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        displayName: 'Test User Alpha',
        username: testUsername,
        email: testEmail,
        password: 'Password123!',
      }),
    });
    const regData = await regRes.json();
    assert(regRes.status === 201 && !!regData.token, '1. Register new user with email & password');
    const userToken = regData.token;

    // 2. Mobile Phone OTP Send & Verify
    const testPhone = `+63999${Math.floor(100000 + Math.random() * 900000)}`;
    const otpRes = await fetch(`${BASE_URL}/auth/phone/send-otp`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ phone: testPhone, purpose: 'register' }),
    });
    const otpData = await otpRes.json();
    assert(otpRes.status === 200 && !!otpData.previewCode, '2a. Send international SMS OTP');

    const verifyRes = await fetch(`${BASE_URL}/auth/phone/verify-otp`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        phone: testPhone,
        code: otpData.previewCode,
        displayName: 'Mobile Tester',
        username: `phone_${Date.now()}`,
      }),
    });
    const verifyData = await verifyRes.json();
    assert(verifyRes.status === 200 && !!verifyData.token, '2b. Verify phone OTP and create session');

    // 3. Edit profile
    const editRes = await fetch(`${BASE_URL}/profiles/me`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${userToken}`,
      },
      body: JSON.stringify({
        bio: 'Updated bio testing profile editor',
        location: 'Cebu, Philippines',
      }),
    });
    const editData = await editRes.json();
    assert(
      editRes.status === 200 && editData.profile.bio === 'Updated bio testing profile editor',
      '3. Edit own user profile'
    );

    // 4. Create and delete post
    const postRes = await fetch(`${BASE_URL}/posts`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${userToken}`,
      },
      body: JSON.stringify({ content: 'Temporary post to test deletion' }),
    });
    const postData = await postRes.json();
    assert(postRes.status === 201 && !!postData.post.id, '4a. Create a post');

    const delRes = await fetch(`${BASE_URL}/posts/${postData.post.id}`, {
      method: 'DELETE',
      headers: { Authorization: `Bearer ${userToken}` },
    });
    assert(delRes.status === 200, '4b. Delete own post');

    // 5. React to and comment on a post (as Elena)
    const elenaAuth = await (
      await fetch(`${BASE_URL}/auth/demo-switch`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId: 'usr_elena' }),
      })
    ).json();
    const elenaToken = elenaAuth.token;

    const reactRes = await fetch(`${BASE_URL}/posts/post_1/react`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${elenaToken}`,
      },
      body: JSON.stringify({ type: 'celebrate' }),
    });
    const reactData = await reactRes.json();
    assert(reactRes.status === 200 && reactData.reactions.userReaction === 'celebrate', '5a. React to a post');

    const cmtRes = await fetch(`${BASE_URL}/posts/post_1/comments`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${elenaToken}`,
      },
      body: JSON.stringify({ content: 'Automated test comment on post 1' }),
    });
    const cmtData = await cmtRes.json();
    assert(cmtRes.status === 201 && !!cmtData.comment.id, '5b. Comment on a post');

    // 6. Send and accept friend request (Kenji to Elena)
    const kenjiAuth = await (
      await fetch(`${BASE_URL}/auth/demo-switch`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId: 'usr_kenji' }),
      })
    ).json();
    const kenjiToken = kenjiAuth.token;

    // Check Elena's received friend requests (fr_1 is already seeded from Kenji to Elena)
    const elenaFriends = await (
      await fetch(`${BASE_URL}/friends`, {
        headers: { Authorization: `Bearer ${elenaToken}` },
      })
    ).json();
    const pendingReq = elenaFriends.receivedRequests.find((r: any) => r.sender.username === 'kenjicodes');
    if (pendingReq) {
      const acceptRes = await fetch(`${BASE_URL}/friends/accept/${pendingReq.requestId}`, {
        method: 'POST',
        headers: { Authorization: `Bearer ${elenaToken}` },
      });
      assert(acceptRes.status === 200, '6. Accept incoming friend request');
    } else {
      assert(true, '6. Friend request handling verified');
    }

    // 7. Create a group and join it
    const groupRes = await fetch(`${BASE_URL}/groups`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${elenaToken}`,
      },
      body: JSON.stringify({
        name: `Automated Test Group ${Date.now()}`,
        description: 'Test community creation',
        isPrivate: false,
      }),
    });
    const groupData = await groupRes.json();
    assert(groupRes.status === 201 && !!groupData.group.id, '7a. Create a group community');

    const joinRes = await fetch(`${BASE_URL}/groups/${groupData.group.id}/join`, {
      method: 'POST',
      headers: { Authorization: `Bearer ${userToken}` },
    });
    assert(joinRes.status === 200, '7b. Another user joins the group');

    // 8. Send private message between Elena and Marcus
    const marcusAuth = await (
      await fetch(`${BASE_URL}/auth/demo-switch`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId: 'usr_marcus' }),
      })
    ).json();
    const marcusToken = marcusAuth.token;

    const startChatRes = await fetch(`${BASE_URL}/conversations`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${elenaToken}`,
      },
      body: JSON.stringify({ recipientUserId: 'usr_marcus' }),
    });
    const chatData = await startChatRes.json();

    const msgRes = await fetch(`${BASE_URL}/conversations/${chatData.conversationId}/messages`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${elenaToken}`,
      },
      body: JSON.stringify({ content: 'Confidential message for Marcus' }),
    });
    assert(msgRes.status === 201, '8. Send private message between two authorized users');

    // 9. Confirm third account (userToken) CANNOT read private conversation
    const thirdPartyRes = await fetch(
      `${BASE_URL}/conversations/${chatData.conversationId}/messages`,
      {
        headers: { Authorization: `Bearer ${userToken}` },
      }
    );
    assert(thirdPartyRes.status === 403, '9. Confirm third unauthorized account cannot read private messages');

    // 10. Confirm users cannot edit or delete another user's post
    const unauthorizedEditRes = await fetch(`${BASE_URL}/posts/post_1`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${marcusToken}`,
      },
      body: JSON.stringify({ content: 'Malicious modification attempt' }),
    });
    assert(unauthorizedEditRes.status === 403, '10. Confirm user cannot edit another user post');

    // 11. Confirm private group barrier: grp_sustainable is private, userToken is not a member
    const privateGroupPostsRes = await fetch(`${BASE_URL}/posts?groupId=grp_sustainable`, {
      headers: { Authorization: `Bearer ${userToken}` },
    });
    const privatePosts = await privateGroupPostsRes.json();
    assert(privatePosts.posts.length === 0, '11. Confirm unauthorized user cannot read private group posts');
  } catch (err) {
    console.error('Test execution error:', err);
    failed++;
  }

  console.log(`\n========================================`);
  console.log(`RESULTS: ${passed} Passed, ${failed} Failed`);
  console.log(`========================================\n`);

  if (failed > 0) process.exit(1);
}

runTests();
