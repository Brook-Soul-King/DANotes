import { inject, Injectable } from '@angular/core';
import { Note } from '../interfaces/note.interface';
import { Firestore, collectionData, collection, doc, onSnapshot, addDoc, updateDoc, deleteDoc, where, orderBy, limit, query } from '@angular/fire/firestore';
import { Observable } from 'rxjs';


@Injectable({
  providedIn: 'root'
})
export class NoteListService {

  trashNotes: Note[] = [];
  normalNotes: Note[] = [];
  normalMarkedNotes: Note[] = [];
  unsubTrash;
  unsubNotes;
  unsubMarkedNotes;

  firestore: Firestore = inject(Firestore);

  constructor() {
    this.unsubNotes = this.subNotesList();
    this.unsubMarkedNotes = this.subMarkedNotesList();
    this.unsubTrash = this.subTrashList();

  }

  async deleteNote(colId: "notes" | "trash", docId: string) {
    await deleteDoc(this.getSingleDocRef(colId, docId)).catch(
      (err) => { console.error(err) }
    ).then();
  }

  async updateNote(note: Note) {
    if (note.id) {
      let docRef = this.getSingleDocRef(this.getColIdFromNote(note), note.id);
      await updateDoc(docRef, this.getCleanJson(note)).catch(
        (err) => { console.error(err); }
      ).then();
    }
  }

  getCleanJson(note: Note): {} {
    return {
      type: note.type,
      title: note.title,
      content: note.content,
      marked: note.marked,
    }
  }

  getColIdFromNote(note: Note) {
    if (note.type == 'note') {
      return 'notes'
    } else {
      return 'trash'
    }
  }

  // async addNote(item: Note, colId: "notes" | "trash") {
  //   if (colId == "notes") {
  //     await addDoc(this.getNotesRef(), item).catch(
  //       (err) => { console.error(err) }
  //     ).then(
  //       (docRef) => { console.log("Document written with ID: ", docRef?.id); }
  //     )
  //   } else {
  //     await addDoc(this.getTrashRef(), item).catch(
  //       (err) => { console.error(err) }
  //     ).then(
  //       (docRef) => { console.log("Document written with ID: ", docRef?.id); }
  //     )
  //   }
  // }

  async addNote(item: Note, colId: "notes" | "trash") {
    try {
      const ref = colId === "notes"
        ? this.getNotesRef()
        : this.getTrashRef();

      const docRef = await addDoc(ref, item);
      console.log("Document written with ID: ", docRef.id);
    } catch (err) {
      console.error("Error writing document:", err);
    }
  }

  ngonDestroy() {
    this.unsubNotes();
    this.unsubTrash();
    this.unsubMarkedNotes();
  }

  subTrashList() {
    return onSnapshot(this.getTrashRef(), (list) => {
      this.trashNotes = [];
      list.forEach(element => {
        this.trashNotes.push(this.setNoteObject(element.data(), element.id))
      })
    });
  }

  subNotesList() {
    const q = query(this.getNotesRef(), where("type", "==", "note"), limit(100))
    return onSnapshot(q, (list) => {
      this.normalNotes = [];
      list.forEach(element => {
        this.normalNotes.push(this.setNoteObject(element.data(), element.id));
      })
    });
  }

  subMarkedNotesList() {
    const q = query(this.getNotesRef(), where("marked", "==", true), limit(100))
    return onSnapshot(q, (list) => {
      this.normalMarkedNotes = [];
      list.forEach(element => {
        this.normalMarkedNotes.push(this.setNoteObject(element.data(), element.id));
      })
    });
  }

  setNoteObject(obj: any, id: string): Note {
    return {
      id: id || "",
      type: obj.type || "note",
      title: obj.title || "",
      content: obj.content || "",
      marked: obj.marked || false,
    }
  }

  getNotesRef() {
    return collection(this.firestore, 'notes');
  }

  getTrashRef() {
    return collection(this.firestore, 'trash');
  }

  getSingleDocRef(colId: string, docId: string) {
    return doc(collection(this.firestore, colId), docId);
  }
}
