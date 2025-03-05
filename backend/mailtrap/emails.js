import { mailtrapClient, sender } from "./mailtrapConfig.js"
import {VERIFICATION_EMAIL_TEMPLATE, PASSWORD_RESET_SUCCESS_TEMPLATE,PASSWORD_RESET_REQUEST_TEMPLATE} from '../mailtrap/emailTemplate.js'
import { response } from "express"

export const sendVerificationEmail = async (email, verificationToken) => {
    const recipient = [{email}]

    try {
        const response = await mailtrapClient.send({
            from: sender,
            to: recipient,
            subject: "verify your email",
            html: VERIFICATION_EMAIL_TEMPLATE.replace("{verificationCode}", verificationToken),
            category: "Email Verification",
        })

        console.log("Email sent successfully",response)

    } catch (error) {
        console.error(`Error sending verifiaction`, error)
        throw new Error(`Error sending verification email: ${error}`);
    }
}

export const sendWelcomeEmail = async (email, name) => {
    const recipient = [{email}]

    try {
        await mailtrapClient.send({
            from: sender,
            to: recipient,
            template_uuid: "751952dd-db41-4ef6-abc4-d4d6f25e26c7",
            template_variables: {
                company_info_name: "Auth Company",
                name: name,
            }
        })

        console.log("Welcome email sent successfully", response)
    } catch (error) {
        console.error(`Error sending verifiaction`, error)
        throw new Error(`Error sending verification email: ${error}`);
    }
}

export const sendPasswordResetEmail = async (email,resetURL) => {
    const recipient = [{email}];

    try {
        const response = await mailtrapClient.send({
            from: sender,
            to: recipient,
            subject: "Reset your password",
            html: PASSWORD_RESET_REQUEST_TEMPLATE.replace("{resetURL}", resetURL),
            category: "Password Reset",
        })
    } catch (error) {
        console.log(`Error sending password reset email`, error);

        throw new Error(`Error sending password reset email: ${error}`)
    }
}

export const sendResetSuccessEmail = async (email) => {
    const recipient = [{email}]

    try {
        const response = await mailtrapClient.send({
            from: sender,
            to: recipient,
            subject: "Password reset successful",
            html: PASSWORD_RESET_SUCCESS_TEMPLATE,
            category: "Password Reset"
        })

        console.log("Password reset email sent successfully", response)
    } catch (error) {
        console.log(`Error sending password reset success email`, error);
        throw new Error(`Error sending password reset success email: ${error}`)
    }
}