import { faArrowLeft } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { useNavigate } from "react-router-dom";

const TermsPage = () => {
    const navigate = useNavigate()

    return (
        <div className="flex flex-col p-[5vw]">
            <button onClick={() => {
                navigate('/')
            }} className="rounded-xl p-3 border border-gray-200 transition hover:bg-gray-200 flex items-center gap-2 max-w-fit mb-5">
                <FontAwesomeIcon icon={faArrowLeft} />
                Return to Canvas
            </button>
            <div className="flex flex-col md:flex-row items-center gap-2">
                <img alt='ChaosCanvas AI generated logo' src={'logo512.png'} className="w-40 h-40" />
                <div className="flex flex-col font-inter">
                    <h1 className="text-4xl font-regular">
                        ChaosCanvas
                    </h1>
                    <h1 className="text-3xl font-light">
                        Terms, Conditions and Privacy Policy
                    </h1>
                </div>
            </div>
            
            <div className="mt-8 font-inter">
                <h2 className="text-2xl font-semibold">Terms and Conditions</h2>
                <p className="mt-4 text-sm">
                    <b>Last Updated: 24/09/2024 @ 20:00</b>
                </p>
                <p className="mt-4 text-sm">
                    Welcome to ChaosCanvas! By accessing and using this website, you agree to comply with and be bound by the following terms and conditions. Please read them carefully. If you do not agree to these terms, please do not use this website.
                </p>

                <h3 className="mt-6 text-xl font-semibold">1. Data Retention</h3>
                <p className="mt-2 text-sm">
                    We do not retain any personal information other than:
                    <ul className="list-disc ml-4">
                        <li>The content you draw on the canvas.</li>
                        <li>Your IP address, which is automatically logged for operational and security purposes.</li>
                        <li>Chat messages, which may be stored for a short period or permanently.</li>
                    </ul>
                    By using this website, you consent to the collection and retention of this data. You may contact us to request the removal of personal data, in compliance with applicable privacy laws.
                </p>

                <h3 className="mt-6 text-xl font-semibold">2. Cookies</h3>
                <p className="mt-2 text-sm">
                    By using this website, you agree to the use of cookies for the sole purpose of tracking whether you have accepted the terms and conditions. Cookies may also be used for basic functionality such as remembering your session. We do not use cookies for tracking or advertising purposes.
                </p>

                <h3 className="mt-6 text-xl font-semibold">3. Content Policy</h3>
                <p className="mt-2 text-sm">
                    <strong>No NSFW Content:</strong> You agree not to draw or create any content that is deemed Not Safe For Work (NSFW). This includes, but is not limited to:
                    <ul className="list-disc ml-4">
                        <li>Pornographic material</li>
                        <li>Gore or extreme violence</li>
                        <li>Other inappropriate or harmful material</li>
                    </ul>
                    Failure to comply will result in a permanent ban of your device and IP address from accessing the site.
                </p>

                <h3 className="mt-6 text-xl font-semibold">4. Copyrighted Content</h3>
                <p className="mt-2 text-sm">
                    You are responsible for ensuring that the content you create does not violate copyright laws. <strong>Do not draw copyrighted material</strong> unless you have permission to use it. ChaosCanvas does not assume any responsibility for legal issues arising from the use of copyrighted material, and you agree to indemnify and hold harmless ChaosCanvas from any claims arising from your content.
                </p>

                <h3 className="mt-6 text-xl font-semibold">5. No Guarantee of Content Moderation</h3>
                <p className="mt-2 text-sm">
                    <strong>No Moderation Team:</strong> We do not have a dedicated moderation team monitoring the content in real time. Harmful content can be removed by other users via overwriting, but this is not guaranteed. Although we strive to maintain a safe environment, we do not guarantee that NSFW or harmful content will not appear. Users may report harmful content, and we will make reasonable efforts to address reported issues.
                </p>

                <h3 className="mt-6 text-xl font-semibold">6. User Responsibility</h3>
                <p className="mt-2 text-sm">
                    <strong>Non-Harmful Use:</strong> By using the site, you agree to use it in a non-harmful and fun manner. You agree to:
                    <ul className="list-disc ml-4">
                        <li>Only create safe-for-work (SFW) content.</li>
                        <li>Not engage in illegal activities or violate any applicable laws while using the site.</li>
                    </ul>
                    You are responsible for your own actions, and any violations may result in the loss of access to the site.
                </p>

                <h3 className="mt-6 text-xl font-semibold">7. No Warranty</h3>
                <p className="mt-2 text-sm">
                    <strong>Service Availability:</strong> We do not guarantee that the website will be available at all times. The site may be taken offline or shut down at any time without prior notice.
                    <br />
                    <strong>No Warranty:</strong> ChaosCanvas is provided "as-is" without any warranties of any kind. We do not guarantee the accuracy, functionality, or availability of the website.
                </p>

                <h3 className="mt-6 text-xl font-semibold">8. IP and Device Bans</h3>
                <p className="mt-2 text-sm">
                    If you violate the terms of this agreement, we reserve the right to:
                    <ul className="list-disc ml-4">
                        <li>Ban your IP address from accessing the site.</li>
                        <li>Prevent access from your device permanently.</li>
                    </ul>
                    You may appeal a ban by contacting us if you believe the ban was made in error. We will review appeals on a case-by-case basis, but we do not guarantee that any ban will be lifted.
                </p>

                <h3 className="mt-6 text-xl font-semibold">9. Chat Usage</h3>
                <p className="mt-2 text-sm">
                    By using the chat feature on ChaosCanvas, you agree to abide by the following rules to maintain a safe and positive environment for all users:
                    <ul className="list-disc ml-4">
                        <li><strong>No Illegal Activities:</strong> The chat must not be used for any illegal purposes, including but not limited to promoting, facilitating, or engaging in illegal activities.</li>
                        <li><strong>No Promotions or Sales:</strong> The chat is intended for communication between artists and must not be used for promotions, advertising, selling products or services, or any commercial activities.</li>
                        <li><strong>No Harassment or NSFW Content:</strong> Messages must not contain harassment, hate speech, or any inappropriate content, including unwanted or unsolicited NSFW (Not Safe For Work) material.</li>
                        <li><strong>No DDoS, Doxing, or Hacking:</strong> The chat cannot be used to engage in, promote, or discuss activities related to Distributed Denial of Service (DDoS) attacks, doxing, or any form of hacking.</li>
                        <li><strong>No Links to External Sites:</strong> Do not post links to external websites in the chat.</li>
                        <li><strong>Respectful Communication:</strong> All messages must be respectful and constructive. Harmful language, spamming, and trolling are strictly prohibited.</li>
                    </ul>
                    Violation of any of these rules may result in a permanent ban from the chat or the website entirely. Due to the lack of real-time moderation, bans are likely permanent.
                </p>

                <h2 className="mt-8 text-2xl font-semibold">Privacy Policy</h2>

                <h3 className="mt-6 text-xl font-semibold">1. Data Collected</h3>
                <p className="mt-2 text-sm">
                    <ul className="list-disc ml-4">
                        <li>We collect IP addresses for security, operational purposes, and tracking malicious activity.</li>
                        <li>The drawings or content you create on the canvas may be stored temporarily on our servers. This content is public and can be overwritten or modified by other users.</li>
                        <li>Chat messages may be retained for a short amount of time, or permanently. By using the chat, you acknowledge that your messages are visible to all active users at the time of sending, and potentially to others later.</li>
                    </ul>
                </p>

                <h3 className="mt-6 text-xl font-semibold">2. Cookies</h3>
                <p className="mt-2 text-sm">
                    Cookies are used to track whether you have accepted the Terms and Conditions. These cookies are necessary for the website to function properly. We do not use cookies for tracking or advertising purposes.
                </p>

                <h3 className="mt-6 text-xl font-semibold">3. How We Use Your Information</h3>
                <p className="mt-2 text-sm">
                    The information we collect (IP address, chat messages, and content) is used solely to:
                    <ul className="list-disc ml-4">
                        <li>Ensure the operational stability of the website.</li>
                        <li>Enforce the Terms and Conditions.</li>
                        <li>Maintain security on the website by banning harmful users if necessary.</li>
                    </ul>
                </p>

                <h3 className="mt-6 text-xl font-semibold">4. Sharing of Data</h3>
                <p className="mt-2 text-sm">
                    We do not share, sell, or distribute your personal information or drawing data to third parties. All data is kept solely for the purpose of running the website.
                </p>

                <h3 className="mt-6 text-xl font-semibold">5. Security</h3>
                <p className="mt-2 text-sm">
                    We take reasonable precautions to protect your data. However, no data transmission over the internet or storage system is 100% secure, and we cannot guarantee the absolute security of your data.
                </p>

                <h3 className="mt-6 text-xl font-semibold">6. User Rights</h3>
                <p className="mt-2 text-sm">
                    <strong>Right to Remove Content:</strong> If you wish to remove any content you have created, you may do so by overwriting it yourself - this is the only way to remove content from the site, unless a rare moderation event occurs.
                    <br />
                    <strong>Right to Anonymity:</strong> You may use this site without providing any personally identifiable information other than your IP address.
                </p>

                <h3 className="mt-6 text-xl font-semibold">7. Changes to the Privacy Policy</h3>
                <p className="mt-2 text-sm">
                    This Privacy Policy may be updated periodically. We encourage users to review it frequently. Continued use of the website after any changes to this policy will constitute your acknowledgment and acceptance of the terms.
                </p>
            </div>
        </div>
    );
}

export default TermsPage;
