import appointmentConfirmationEmail from "@/components/emails/appointmentConfirmationEmail";
import resend from "@/lib/resend";
import { NextResponse } from "next/server";

export async function POST(request: Request) {
  try {
    //czyta dane wysłane przez frontend.
    const body = await request.json();

    const {
      userEmail,
      doctorName,
      appointmentDate,
      appointmentTime,
      appointmentType,
      duration,
      price,
    } = body;

    // validate required fields
    if (!userEmail || !doctorName || !appointmentDate || !appointmentTime) {
      return NextResponse.json(
        { error: "Missing required fields" },
        { status: 400 },
      );
    }

    // send the email
    // do not use this in prod, only for testing purposes
    const { data, error } = await resend.emails.send({
      from: "DentWise <no-reply@resend.dev>",
      to: [userEmail],
      subject: "Appointment Confirmation - DentWise",
      react: appointmentConfirmationEmail({
        doctorName,
        appointmentDate,
        appointmentTime,
        appointmentType,
        duration,
        price,
      }),
    });

    if (error) {
      console.error("Resend error:", error);
      return NextResponse.json(
        { error: "Failed to send email" },
        { status: 500 },
      );
    }
    //To jest odpowiednik Expressa:
    // res.status(200).json({ message: "Email sent successfully", emailId: data?.id });
    return NextResponse.json(
      { message: "Email sent successfully", emailId: data?.id },
      { status: 200 },
    );
  } catch (error) {
    console.error("Email sending error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 },
    );
  }
}
