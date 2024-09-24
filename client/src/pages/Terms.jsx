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
                    <b>Last Updated: 24/09/2024 @ 10:04</b>
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
                    </ul>
                    Cookies are stored on your device to track whether you have accepted the terms and conditions. No other data is retained or shared with third parties.
                </p>

                <h3 className="mt-6 text-xl font-semibold">2. Cookies</h3>
                <p className="mt-2 text-sm">
                    By using this website, you agree to the use of cookies for the sole purpose of tracking whether you have accepted the terms and conditions. Cookies may also be used for basic functionality such as remembering your session.
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

                <h3 className="mt-6 text-xl font-semibold">4. No Guarantee of Content Moderation</h3>
                <p className="mt-2 text-sm">
                    <strong>No Moderation Team:</strong> We do not have a dedicated moderation team monitoring the content in real time. Harmful content can be removed by other users via overwriting, but this is not guaranteed. While we strive to maintain a safe environment, we do not guarantee that NSFW or harmful content will not appear. You use the site at your own discretion.
                </p>

                <h3 className="mt-6 text-xl font-semibold">5. User Responsibility</h3>
                <p className="mt-2 text-sm">
                    <strong>Non-Harmful Use:</strong> By using the site, you agree to use it in a non-harmful and fun manner. You agree to:
                    <ul className="list-disc ml-4">
                        <li>Only create safe-for-work (SFW) content.</li>
                        <li>Not engage in illegal activities or violate any applicable laws while using the site.</li>
                    </ul>
                    You are responsible for your own actions, and any violations may result in the loss of access to the site.
                </p>

                <h3 className="mt-6 text-xl font-semibold">6. No Warranty</h3>
                <p className="mt-2 text-sm">
                    <strong>Service Availability:</strong> We do not guarantee that the website will be available at all times. The site may be taken offline or shut down at any time without prior notice.
                    <br />
                    <strong>No Warranty:</strong> ChaosCanvas is provided "as-is" without any warranties of any kind. We do not guarantee the accuracy, functionality, or availability of the website.
                </p>

                <h3 className="mt-6 text-xl font-semibold">7. IP and Device Bans</h3>
                <p className="mt-2 text-sm">
                    If you violate the terms of this agreement, we reserve the right to:
                    <ul className="list-disc ml-4">
                        <li>Ban your IP address from accessing the site.</li>
                        <li>Prevent access from your device permanently.</li>
                    </ul>
                    Such bans will not be reversed unless deemed appropriate by the website administrators.
                </p>

                <h3 className="mt-6 text-xl font-semibold">8. Changes to the Terms and Conditions</h3>
                <p className="mt-2 text-sm">
                    We reserve the right to modify or update these Terms and Conditions at any time. Any changes will be posted on this page, and your continued use of the site will constitute acceptance of any changes.
                </p>

                <h2 className="mt-8 text-2xl font-semibold">Privacy Policy</h2>

                <h3 className="mt-6 text-xl font-semibold">1. Data Collected</h3>
                <p className="mt-2 text-sm">
                    <ul className="list-disc ml-4">
                        <li>We collect IP addresses for security, operational purposes, and tracking malicious activity.</li>
                        <li>The drawings or content you create on the canvas may be stored temporarily on our servers. This content is public and can be overwritten or modified by other users.</li>
                    </ul>
                </p>

                <h3 className="mt-6 text-xl font-semibold">2. Cookies</h3>
                <p className="mt-2 text-sm">
                    Cookies are used to track whether you have accepted the Terms and Conditions. These cookies are necessary for the website to function properly. We do not use cookies for tracking or advertising purposes.
                </p>

                <h3 className="mt-6 text-xl font-semibold">3. How We Use Your Information</h3>
                <p className="mt-2 text-sm">
                    The information we collect (IP address and content) is used solely to:
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
                    <strong>Right to Remove Content:</strong> If you wish to remove any content you have created, you may do so by overwriting it yourself - this is the only way to remove content from the site other than it being moderated, on the rare occasion a moderation occurs.
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

export default TermsPage