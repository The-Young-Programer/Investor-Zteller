import { db } from "@/lib/firebase"
import { doc, getDoc, updateDoc, Timestamp } from "firebase/firestore"
import { type NextRequest, NextResponse } from "next/server"

export async function GET(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const { id } = params
    const docRef = doc(db, "investors", id)
    const docSnap = await getDoc(docRef)

    if (!docSnap.exists()) {
      return NextResponse.json({ error: "Application not found" }, { status: 404 })
    }

    return NextResponse.json({
      id: docSnap.id,
      ...docSnap.data(),
    })
  } catch (error) {
    console.error("Error fetching application:", error)
    return NextResponse.json({ error: "Failed to fetch application" }, { status: 500 })
  }
}

export async function PATCH(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const { id } = params
    const body = await request.json()

    const docRef = doc(db, "investors", id)
    const updateData = {
      ...body,
      updatedAt: Timestamp.now(),
    }

    await updateDoc(docRef, updateData as { [x: string]: any })

    const updatedDoc = await getDoc(docRef)
    return NextResponse.json({
      id: updatedDoc.id,
      ...updatedDoc.data(),
    })
  } catch (error) {
    console.error("Error updating application:", error)
    return NextResponse.json({ error: "Failed to update application" }, { status: 500 })
  }
}
