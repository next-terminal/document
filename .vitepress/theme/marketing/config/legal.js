// 法律页内容（privacy / terms 共用）：文案逐字取自原 Astro 站
// website/src/i18n/en.ts 与 zh.ts 的 legal 段；termsBody / privacyBody 为
// src/content/terms.*、privacy.* 的默认导出原文，逐字内联，保持原结构。
// 与 pricing / cases 页一致的组织方式：每语言一个对象，LegalPage.vue 只消费 content.legal；
// kind 由页面（md）放入 content，决定渲染隐私政策还是服务条款。
export const legalContent = {
    en: {
        meta: {
            terms: {
                title: 'Terms of Service | Next Terminal',
                description: 'Terms of service for the Next Terminal website.',
            },
            privacy: {
                title: 'Privacy Policy | Next Terminal',
                description: 'Next Terminal privacy policy: how we collect, use, and protect your personal information.',
            },
        },
        legal: {
            termsTitle: 'Terms of Service',
            privacyTitle: 'Privacy Policy',
            termsBody: `Welcome to our website services. Please read and understand these Terms of Service carefully before using our services. By using our services, you agree to comply with these terms.

1 Service Overview
Our website provides various functions and services, including but not limited to registration and sign-in features and other related services. These services may be adjusted and updated according to business needs.

2 User Responsibilities
2.1 Registration Requirements
Before using our services, you may need to create an account. You must provide accurate, complete, and up-to-date information and update your profile promptly. You may not impersonate others when registering an account.
2.2 Account Security
You are responsible for keeping your account and password confidential and for all activity under your account. You should take appropriate measures to protect your account security and avoid disclosing account information to others.
2.3 Lawful Use
You agree to comply with all applicable laws, regulations, and rules when using our services. You may not use our services for illegal, abusive, defamatory, malicious, or rights-infringing activities.

3 Intellectual Property
Our website and services contain content protected by intellectual property laws, including but not limited to text, images, logos, icons, and software. Unless expressly authorized by us or relevant rights holders, you may not copy, modify, distribute, transmit, or use such content in any form.

4 Disclaimer
4.1 Nature of Services
Our website and services are provided "as is" without any express or implied warranties. We do not guarantee suitability, accuracy, reliability, or completeness. You use our services at your own risk.
4.2 Third-party Links and Content
Our website may contain links to third-party websites or services and may display content provided by third parties. These links and content are provided for reference and convenience only and do not constitute our endorsement or commitment. You access them at your own judgment and risk.
4.3 Data Loss and Security
Although we take reasonable measures to protect data security, technical limitations and the unpredictability of the internet mean we cannot guarantee absolute security. We are not liable for losses or damages caused by data loss, leakage, or unauthorized access.

5 Termination and Revisions
We reserve the right to terminate, suspend, or restrict your use of our services at any time. We also reserve the right to revise and update these Terms of Service at any time. For major changes, we will post a notice on the website and make reasonable efforts to provide advance notice through appropriate means.

6 Governing Law and Dispute Resolution
These Terms of Service are governed by the laws of the People's Republic of China. Any dispute arising from these terms or use of our services should be resolved through friendly negotiation. If negotiation fails, the dispute shall be submitted to a court with jurisdiction.

7 Other Terms
These Terms of Service constitute the entire agreement between you and us regarding use of our services and supersede any prior oral or written agreements. Failure to exercise or enforce any right or provision does not constitute a waiver. If any provision is found invalid or unenforceable, it shall be interpreted as closely as possible to the original intent, and the remaining provisions remain in full force.

Thank you for reading our Terms of Service. If you have questions, please contact us:

We will do our best to respond to your request and address your concerns within a reasonable time.

By using our services, you agree to comply with these Terms of Service.`,
            privacyBody: `Thank you for visiting and using our website. We value your privacy and are committed to providing a safe and reliable online experience. This Privacy Policy explains how we collect, use, and protect your personal information. Please read this policy carefully before using our services.

1 Information Collection and Use
1.1 Registration Information
When you register on our website, we may collect personal information including, but not limited to, your name, email address, and contact number. This information is used to create and manage your account and to provide notices and updates related to our services.
1.2 Log Data
Our website may automatically collect log data related to your visits. This data may include your IP address, browser type, access time and date, and interactions with our website. We use this information to analyze user behavior, manage the website, diagnose technical issues, and improve service quality.
1.3 Cookies and Similar Technologies
We use cookies and similar technologies to collect and store certain information. Cookies are small text files stored on your computer or mobile device to identify your browser or device. These technologies help us provide a personalized experience, such as remembering preferences and sign-in status. You can refuse or manage cookies through browser settings. Disabling cookies may affect your access to and use of our website.

2 Information Protection
We use reasonable technical and organizational measures to protect your personal information from unauthorized access, use, or disclosure. We use SSL technology to encrypt sensitive information in transit. However, because the internet is open by nature, we cannot fully guarantee information security and are not responsible for losses or damages caused by unauthorized access, use, or disclosure.
2.1 Information Sharing and Disclosure
We do not sell, trade, or otherwise transfer your personal information to third parties unless explicitly authorized by you or required by law. We may share certain information with partners to provide better service and support.
2.2 Third-party Links
Our website may contain links to third-party websites or services. We are not responsible for the privacy policies or content of those links. You access them at your own risk and should read and understand their privacy policies.

3 Legal Requirements
We may disclose your personal information when required by law or authorized government agencies. We also reserve the right to take lawful action when necessary to protect our own rights.
3.1 Minors' Privacy
Our website is not intended for minors below the legal age. If you are a minor, please use our services under the guidance of a legal guardian.
3.2 Changes to This Privacy Policy
We reserve the right to update this Privacy Policy at any time. For major changes, we will post a notice on the website and make reasonable efforts to provide advance notice through appropriate means.

4 Contact Us
If you have questions, comments, or complaints about this Privacy Policy, or need to access, correct, or delete your personal information, please contact us:

We will do our best to respond to your request and address your concerns within a reasonable time.

Thank you for taking the time to read our Privacy Policy. By using our services, you agree to be bound by this Privacy Policy.`,
        },
    },
    zh: {
        meta: {
            terms: {
                title: '服务条款｜Next Terminal',
                description: 'Next Terminal 网站服务条款。',
            },
            privacy: {
                title: '隐私政策｜Next Terminal',
                description: 'Next Terminal 隐私政策：我们如何收集、使用和保护您的个人信息。',
            },
        },
        legal: {
            termsTitle: '服务条款',
            privacyTitle: '隐私政策',
            termsBody: `欢迎使用我们的网站服务！请在使用我们的服务之前仔细阅读并理解以下服务条款。通过使用我们的服务，即表示您同意遵守本条款的规定。

1 服务概述
我们的网站提供各种功能和服务，包括但不限于提供注册和登录功能，以及其他相关服务。这些服务可能会根据我们的业务需求进行调整和更新。

2 用户责任
2.1 注册要求
在使用我们的服务之前，您可能需要创建一个帐户。您必须提供准确、完整和最新的信息，并及时更新您的个人资料。您不得冒用他人身份注册帐户。
2.2 帐户安全
您对您的帐户和密码负有保密责任，并对您的帐户活动承担全部责任。您应采取适当的措施保护您的帐户安全，避免将您的帐户信息透露给他人。
2.3 合法使用
您承诺在使用我们的服务时遵守所有适用的法律、法规和规定。您不得利用我们的服务进行任何非法、滥用、诽谤、恶意攻击或侵犯他人权益的行为。

3 知识产权
我们的网站和服务包含受知识产权法保护的内容，包括但不限于文本、图像、标志、图标和软件。除非获得我们或相关权利人的明确授权，您不得以任何形式复制、修改、分发、传播或利用这些内容。

4 免责声明
4.1 服务提供的性质
我们的网站和服务按"原样"提供，不作任何明示或暗示的保证。我们不保证网站和服务的适用性、准确性、可靠性或完整性。您应自行承担使用我们的服务的风险。
4.2 第三方链接和内容
我们的网站可能包含指向第三方网站或服务的链接，并且可能展示第三方提供的内容。这些链接和内容仅供您参考和便利，并不构成我们对这些第三方的认可或承诺。您访问这些链接和内容是基于您自己的判断和风险。
4.3 数据丢失和安全性
尽管我们采取合理的措施保护数据的安全，但由于技术限制和互联网的不可预见性，我们无法保证数据的绝对安全。对于因数据丢失、泄露或未经授权访问所导致的任何损失或损害，我们不承担责任。

5 终止和修订
我们保留随时终止、暂停或限制您使用我们的服务的权利。我们还保留随时修订和更新本服务条款的权利。对于重大变更，我们将在网站上发布通知，并尽力通过适当的方式向您提供更改前的通知。

6 法律适用和争议解决
本服务条款受中华人民共和国法律管辖。对于因本服务条款或使用我们的服务而产生的任何争议，双方应通过友好协商解决。如协商不成，则应将争议提交至有管辖权的人民法院解决。

7 其他条款
本服务条款构成您与我们之间关于使用我们服务的完整协议，取代任何先前的口头或书面协议。未行使或执行本服务条款的任何权利或规定，并不构成对该权利或规定的放弃。如本服务条款中的任何条款被认定为无效或不可执行，则该条款应尽可能接近原始意图进行解释，而其他条款仍应具有完全效力。

感谢您仔细阅读我们的服务条款。如有任何问题或疑问，请通过以下联系方式与我们取得联系：

我们将尽力在合理时间内回复您的请求和解决您的关切。

通过使用我们的服务，您表示同意遵守以上服务条款的规定。`,
            privacyBody: `感谢您访问并使用我们的网站。我们非常重视您的隐私权保护，并致力于为您提供安全可靠的在线体验。本隐私政策旨在向您说明我们收集、使用和保护您个人信息的方式。请在使用我们的服务之前仔细阅读本隐私政策。

1 信息收集与使用
1.1 注册信息
在您注册我们的网站时，我们可能会收集您的个人信息，包括但不限于姓名、电子邮件地址、联系电话等。这些信息用于创建和管理您的帐户，并向您提供与我们服务相关的通知和更新。
1.2 日志数据
我们的网站可能会自动收集与您的访问相关的日志数据。这些数据可能包括您的IP地址、浏览器类型、访问时间和日期以及您与我们网站的互动信息。这些信息用于分析用户行为、管理网站、诊断技术问题和改进我们的服务质量。
1.3 Cookie和类似技术
我们使用Cookie和类似技术来收集和存储特定信息。Cookie是一种小型文本文件，存储在您的计算机或移动设备上，用于识别您的浏览器或设备。这些技术帮助我们提供个性化的用户体验，例如记住您的偏好设置和登录状态。您可以通过浏览器设置拒绝或管理Cookie。请注意，禁用Cookie可能会影响您对我们网站的访问和使用体验。

2 信息保护
我们采取合理的技术和组织措施来保护您的个人信息免受未经授权的访问、使用或泄露。我们使用安全套接字层（SSL）技术来加密在传输过程中的敏感信息。然而，由于互联网的开放性，我们无法完全保证信息的安全性，因此我们不能对由于未经授权的访问、使用或泄露导致的任何损失或损害负责。
2.1 信息共享与披露
我们不会出售、交易或以其他方式转让您的个人信息给第三方，除非经过您的明确授权或基于法律要求。但是，我们可能与合作伙伴共享某些信息，以便提供更好的服务和支持。
2.2 第三方链接
我们的网站可能包含指向第三方网站或服务的链接。我们对这些链接的隐私政策或内容不负任何责任。您访问这些链接是基于您自己的风险和判断，并应仔细阅读并理解相关网站的隐私政策。

3 法律要求
我们可能会在法律要求或政府机构授权的情况下披露您的个人信息。我们也保留在必要时依法采取行动保护我们自身的权益。
3.1 未成年人隐私
我们的网站不面向未满法定年龄的未成年人。如果您是未成年人，请在法定监护人的指导下使用我们的服务。
3.2 隐私政策的变更
我们保留随时更新本隐私政策的权利。对于重大变更，我们将在网站上发布通知，并尽力通过适当的方式向您提供更改前的通知。

4. 联系我们
如果您对本隐私政策有任何疑问、意见或投诉，或需要访问、更正、删除您的个人信息，请通过以下联系方式与我们取得联系：

我们将尽力在合理时间内回复您的请求和解决您的关切。

感谢您花时间了解我们的隐私政策。通过使用我们的服务，您同意受本隐私政策的约束。`,
        },
    },
};
